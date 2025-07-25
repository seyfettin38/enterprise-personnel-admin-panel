const fs = require('fs');
const path = require('path');
const OZLUK_FILE = path.join(__dirname, '../data/ozluk.json');

// Bir personele ait belgeleri getir
exports.list = (req, res) => {
  const arr = JSON.parse(fs.readFileSync(OZLUK_FILE, 'utf8'));
  const id = +req.params.id;
  res.json(arr.filter(o => o.personelId === id));
};

// Yeni belge ekle
exports.add = (req, res) => {
  let arr = JSON.parse(fs.readFileSync(OZLUK_FILE, 'utf8'));
  const { personelId, tur } = req.body;
  if (!personelId || !tur || !req.file) return res.status(400).json({ message: 'Alanlar zorunlu.' });
  const yeni = {
    id: Date.now(),
    personelId: +personelId,
    tur,
    dosya: req.file.filename
  };
  arr.push(yeni);
  fs.writeFileSync(OZLUK_FILE, JSON.stringify(arr, null, 2));
  res.json(yeni);
};

// Belge sil
exports.remove = (req, res) => {
  let arr = JSON.parse(fs.readFileSync(OZLUK_FILE, 'utf8'));
  arr = arr.filter(o => o.id !== +req.params.id);
  fs.writeFileSync(OZLUK_FILE, JSON.stringify(arr, null, 2));
  res.end();
};
