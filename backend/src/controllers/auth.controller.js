const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Device = require('../models/device.model');

exports.register = async (req, res) => {
    const { name, email, password, deviceId, publicKey, meta } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash });

    if (deviceId) {
        const device = await Device.create({ owner: user._id, deviceId, publicKey, meta });
        user.devices.push(device._id);
        await user.save();
    }

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user });
};

exports.login = async (req, res) => {
    const { email, password, deviceId, publicKey, bridgefyPeerId, meta } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.verifyPassword(password)))
        return res.status(401).json({ message: 'Invalid credentials' });

    if (deviceId) {
        let device = await Device.findOne({ owner: user._id, deviceId });
        if (!device) {
            device = await Device.create({ owner: user._id, deviceId, publicKey, bridgefyPeerId, meta });
            user.devices.push(device._id);
            await user.save();
        } else {
            device.publicKey = publicKey || device.publicKey;
            device.bridgefyPeerId = bridgefyPeerId || device.bridgefyPeerId;
            device.meta = { ...(device.meta || {}), ...(meta || {}) };
            device.lastSeenAt = new Date();
            await device.save();
        }
    }

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user });
};
