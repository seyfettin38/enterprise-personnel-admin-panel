const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/izinController');
const { personel, admin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', personel, ctrl.listByPersonel); 
router.get('/all', admin, ctrl.list);          
router.get('/kalan', personel, ctrl.getKalanHaklar);
router.get('/kalan/:id', admin, ctrl.getKalanHaklar); 
router.post('/', personel, upload.single('belge'), ctrl.create); 
router.put('/:id', admin, ctrl.updateStatus);

module.exports = router;
