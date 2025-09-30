const mongoose = require('mongoose');

const RelaySchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    deviceId: String,
    relayAt: { type: Date, default: Date.now },
    meta: Object
}, { _id: false });

const SOSSchema = new mongoose.Schema({
    sosId: { type: String, required: true, unique: true },
    originUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    originDeviceId: String,
    encryptedPayload: { type: String, required: true },
    signature: String,
    ttl: { type: Number, default: 7 },
    hops: { type: Number, default: 0 },
    boostersUsed: { type: Number, default: 0 },
    seenBy: [RelaySchema],
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active','acknowledged','resolved','expired'], default: 'active' },
    urgencyScore: { type: Number, default: 0 },
    meta: Object
});

module.exports = mongoose.model('SOS', SOSSchema);
