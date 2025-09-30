const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const deviceCtrl = require('../controllers/device.controller');

router.post('/', auth, deviceCtrl.registerDevice);

module.exports = router;
