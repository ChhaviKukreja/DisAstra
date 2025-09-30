const User = require('../models/user.model');
const Device = require('../models/device.model');

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).populate('devices');
    res.json(user);
};

exports.getUserPublicKeys = async (req, res) => {
    const { id } = req.params;
    const devices = await Device.find({ owner: id }, 'deviceId publicKey bridgefyPeerId meta lastSeenAt');
    res.json(devices);
};
