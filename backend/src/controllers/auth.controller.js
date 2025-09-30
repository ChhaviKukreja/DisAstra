const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Device = require('../models/device.model');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

exports.register = async (req, res) => {
    const { name, email, password, deviceId, publicKey, meta } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });
    if (deviceId) {
        const device = await Device.create({
            owner: user._id,
            deviceId,
            publicKey,
            meta
        });
        user.devices.push(device._id);
        await user.save();
    }
    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
};

exports.login = async (req, res) => {
    const { email, password, deviceId, publicKey, bridgefyPeerId, meta } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // attach(or update) device
    if (deviceId) {
        let device = await Device.findOne({ owner: user._id, deviceId });
        if (!device) {
            device = await Device.create({ owner: user._id, deviceId, publicKey, meta, bridgefyPeerId });
            user.devices.push(device._id);
            await user.save();
        } else {
            device.lastSeenAt = new Date();
            if (publicKey) device.publicKey = publicKey;
            if (bridgefyPeerId) device.bridgefyPeerId = bridgefyPeerId;
            device.meta = { ...(device.meta || {}), ...(meta || {}) };
            await device.save();
        }
    }

    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
};
