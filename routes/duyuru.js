const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/duyuruController');
const { admin, personel, personelOrAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
const duyuruUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

router.get('/', personelOrAdmin, ctrl.list);
router.post('/', admin, duyuruUpload, ctrl.add);
router.put('/:id', admin, duyuruUpload, ctrl.update);
router.delete('/:id', admin, ctrl.remove);
router.get('/:id/readers', admin, ctrl.readers);

module.exports = router;
