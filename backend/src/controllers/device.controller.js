const Device = require('../models/device.model');

exports.registerDevice = async (req, res) => {
    const { deviceId, publicKey, bridgefyPeerId, meta } = req.body;
    let device = await Device.findOne({ owner: req.user._id, deviceId });
    if (!device) {
        device = await Device.create({ owner: req.user._id, deviceId, publicKey, bridgefyPeerId, meta });
    } else {
        device.publicKey = publicKey || device.publicKey;
        device.bridgefyPeerId = bridgefyPeerId || device.bridgefyPeerId;
        device.meta = { ...(device.meta || {}), ...(meta || {}) };
        device.lastSeenAt = new Date();
        await device.save();
    }
    res.json(device);
};
