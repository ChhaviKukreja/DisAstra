const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const sosCtrl = require('../controllers/sos.controller');

router.post('/broadcast', auth, sosCtrl.createAndBroadcast);
router.post('/relay', auth, sosCtrl.relay);
router.get('/active', auth, sosCtrl.getActiveSOS);
router.post('/:sosId/ack', auth, role(['responder','admin']), sosCtrl.acknowledge);

module.exports = router;
