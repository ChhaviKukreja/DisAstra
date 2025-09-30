const User = require('../models/user.model');
const Device = require('../models/device.model');

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).populate('devices');
    res.json(user);
};

// Get public key of user (used by Bridgefy clients to encrypt payloads)
exports.getUserPublicKeys = async (req, res) => {
    const { id } = req.params;
    const devices = await Device.find({ owner: id }, 'deviceId publicKey bridgefyPeerId meta lastSeenAt');
    res.json(devices);
};

exports.registerDevice = async (req, res) => {
    const { deviceId, publicKey, bridgefyPeerId, meta } = req.body;
    let device = await Device.findOne({ owner: req.user._id, deviceId });
    if (!device) device = await Device.create({ owner: req.user._id, deviceId, publicKey, bridgefyPeerId, meta });
    else {
        device.publicKey = publicKey || device.publicKey;
        device.bridgefyPeerId = bridgefyPeerId || device.bridgefyPeerId;
        device.lastSeenAt = new Date();
        device.meta = { ...(device.meta||{}), ...(meta||{}) };
        await device.save();
    }
    res.json(device);
};
