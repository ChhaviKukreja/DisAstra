const Message = require('../models/message.model');
const User = require('../models/user.model');

exports.sendMessage = async (req, res) => {
    // body should be encrypted on client
    const { toUserId, body, metadata } = req.body;
    if (!toUserId || !body) return res.status(400).json({ message: 'Missing fields' });

    const recipient = await User.findById(toUserId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    const message = await Message.create({
        fromUser: req.user._id,
        toUser: toUserId,
        body,
        metadata
    });

    // Optionally emit to recipient via socket (we will wire socket logic)
    req.app.get('io')?.to(String(toUserId)).emit('message:received', {
        messageId: message._id,
        from: req.user._id,
        body,
        metadata,
        createdAt: message.createdAt
    });

    res.json({ ok: true, message });
};

exports.getMessages = async (req, res) => {
    const { withUserId } = req.query;
    if (!withUserId) return res.status(400).json({ message: 'withUserId required' });

    const messages = await Message.find({
        $or: [
            { fromUser: req.user._id, toUser: withUserId },
            { fromUser: withUserId, toUser: req.user._id }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
};
