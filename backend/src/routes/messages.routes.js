const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const messageCtrl = require('../controllers/message.controller');

router.post('/', auth, messageCtrl.sendMessage);
router.get('/', auth, messageCtrl.getMessages);

module.exports = router;
