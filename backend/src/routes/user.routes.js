const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const userCtrl = require('../controllers/user.controller');

router.get('/me', auth, userCtrl.getProfile);
router.get('/:id/keys', auth, userCtrl.getUserPublicKeys);
router.post('/device', auth, userCtrl.registerDevice);

module.exports = router;
