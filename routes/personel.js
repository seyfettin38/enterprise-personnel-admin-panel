const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { personel, admin } = require('../middleware/auth');
const ctrl = require('../controllers/personelController');

// Multer ayarları (foto yükleme)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Personel kayıt/giriş
router.post('/register', ctrl.register); // JSON post
router.post('/login', ctrl.login);       // JSON post
router.get('/me', personel, ctrl.me);    // JWT ile kendi bilgisi

// Personel listele (admin)
router.get('/', admin, ctrl.list); // JWT ile sadece admin görebilir

// Personel ekle (admin paneli - foto yükleme varsa form-data, yoksa JSON)
router.post('/add', admin, upload.single('foto'), ctrl.add);

// Personel güncelle (admin paneli)
router.put('/:id', admin, upload.single('foto'), ctrl.update);

// Personel sil (admin paneli)
router.delete('/:id', admin, ctrl.remove);

module.exports = router;
