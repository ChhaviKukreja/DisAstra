const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true }, // client-side device id
    bridgefyPeerId: { type: String }, // optional: Bridgefy-assigned peer id
    publicKey: { type: String }, // user's public key (for encryption)
    lastSeenAt: { type: Date, default: Date.now },
    meta: {
        battery: Number,
        os: String,
        appVersion: String,
        isBooster: { type: Boolean, default: false }
    } // any extra metadata (os, appVersion)
});

DeviceSchema.index({ deviceId: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Device', DeviceSchema);
