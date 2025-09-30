const SOS = require('../models/sos.model');
const Device = require('../models/device.model');
const { client: redis } = require('../config/redis');

const DEDUPE_WINDOW_SECONDS = parseInt(process.env.SOS_DEDUPE_SECONDS || '300'); // 5 min

// Broadcast a new SOS (created by client when a user presses SOS)
exports.createAndBroadcast = async (req, res) => {
    // body: { sosId, encryptedPayload, signature, ttl, originDeviceId, meta }
    const { sosId, encryptedPayload, signature, ttl = 7, originDeviceId, meta = {} } = req.body;
    if (!sosId || !encryptedPayload) return res.status(400).json({ message: 'sosId and payload required' });

    // dedupe: if we've seen sosId recently, return existing
    const dedupeKey = `sos:dedupe:${sosId}`;
    const seen = await redis.get(dedupeKey);
    if (seen) {
        const existing = await SOS.findOne({ sosId });
        return res.json({ ok: true, existing, note: 'duplicate suppressed' });
    }

    // create record
    const originUser = req.user?._id;
    const sos = await SOS.create({
        sosId,
        originUser,
        originDeviceId,
        encryptedPayload,
        signature,
        ttl,
        hops: 0,
        seenBy: [],
        meta
    });

    // mark dedupe key for window
    await redis.set(dedupeKey, '1', { EX: DEDUPE_WINDOW_SECONDS });

    // emit to online rooms (optionally refine by region)
    req.app.get('io')?.emit('sos:new', {
        sosId, originUser, originDeviceId, meta, createdAt: sos.createdAt
    });

    res.json({ ok: true, sos });
};

// Called when a client receives an SOS via mesh and reports it to server to register a relay.
// Clients should call this to let server decrement TTL and record path
exports.relay = async (req, res) => {
    // body: { sosId, deviceId, meta } // meta includes battery, rssi, locationSnapshot (if allowed)
    const { sosId, deviceId, meta = {} } = req.body;
    const sos = await SOS.findOne({ sosId });
    if (!sos) return res.status(404).json({ message: 'sos not found' });

    // If TTL is already zero or status not active => ignore
    if (sos.ttl <= 0 || sos.status !== 'active') return res.status(400).json({ message: 'not relay-able' });

    // dedupe: check per-device short suppression to avoid same device reporting spam
    const deviceDedupeKey = `sos:device:${sosId}:${deviceId}`;
    const deviceSeen = await redis.get(deviceDedupeKey);
    if (deviceSeen) return res.json({ ok:true, note:'already reported by this device recently' });
    await redis.set(deviceDedupeKey, '1', { EX: 60 }); // 1 minute per-device throttle

    // Decrement TTL and increment hops
    sos.ttl = sos.ttl - 1;
    sos.hops = (sos.hops || 0) + 1;
    sos.lastUpdatedAt = new Date();
    sos.seenBy.push({ deviceId, meta, relayAt: new Date() });

    // Optional booster logic: if device is marked booster, optionally increase ttl (policy)
    const device = await Device.findOne({ deviceId });
    if (device?.meta?.isBooster) {
        // example policy: boosters can add +2 TTL but count boostersUsed
        sos.ttl = sos.ttl + 2;
        sos.boostersUsed = (sos.boostersUsed || 0) + 1;
    }

    if (sos.ttl <= 0) sos.status = 'expired';

    await sos.save();

    // notify responders or clients nearby via socket
    req.app.get('io')?.emit('sos:relay', {
        sosId, deviceId, ttl: sos.ttl, hops: sos.hops, lastUpdatedAt: sos.lastUpdatedAt
    });

    res.json({ ok: true, sos });
};

// Fetch recent SOS for sync
exports.getActiveSOS = async (req, res) => {
    const sosList = await SOS.find({ status: 'active' }).sort({ createdAt: -1 }).limit(200);
    res.json(sosList);
};

// A responder can ack an SOS
exports.acknowledge = async (req, res) => {
    const { sosId } = req.params;
    const sos = await SOS.findOne({ sosId });
    if (!sos) return res.status(404).json({ message: 'not found' });
    sos.status = 'acknowledged';
    await sos.save();
    // notify
    req.app.get('io')?.emit('sos:ack', { sosId, by: req.user._id });
    res.json({ ok: true, sos });
};
