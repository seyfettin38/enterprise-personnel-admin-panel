const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/iletisimController');
const { personel, admin } = require('../middleware/auth');

router.post('/', personel, ctrl.create);
router.get('/', admin, ctrl.list);
router.put('/:id/okundu', admin, ctrl.okunduYap);
router.delete('/:id', admin, ctrl.sil);

module.exports = router;
