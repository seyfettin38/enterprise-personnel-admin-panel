const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/ozlukController');
const { admin } = require('../middleware/auth');

// Dosya yükleme ayarı (uploads klasörü)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Personelin tüm belgelerini getir (Admin)
router.get('/:id', admin, ctrl.list);

// Yeni belge ekle (Admin)
router.post('/', admin, upload.single('dosya'), ctrl.add);

// Belge sil (Admin)
router.delete('/:id', admin, ctrl.remove);

module.exports = router;
