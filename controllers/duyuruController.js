const fs = require('fs');
const path = require('path');
const DUYURU_FILE = path.join(__dirname, '../data/duyurular.json');

exports.list = (req, res) => {
  const user = req.personel || req.admin;
  let arr = JSON.parse(fs.readFileSync(DUYURU_FILE, 'utf8'));
  let changed = false;
  // Sadece personel ise okundu ekle
  if (user && user.id && req.personel) {
    arr.forEach(d => {
      if (!Array.isArray(d.readers)) d.readers = [];
      if (!d.readers.some(r => r.userId === user.id)) {
        d.readers.push({ userId: user.id, ad: user.ad, soyad: user.soyad, date: new Date().toISOString() });
        changed = true;
      }
    });
    if (changed) fs.writeFileSync(DUYURU_FILE, JSON.stringify(arr, null, 2));
  }
  res.json(arr);
};

exports.add = (req, res) => {
  let arr = JSON.parse(fs.readFileSync(DUYURU_FILE, 'utf8'));
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Metin zorunlu.' });
  const yeni = {
    id: Date.now(),
    text,
    image: req.files.image?.[0]?.filename || null,
    video: req.files.video?.[0]?.filename || null,
    createdAt: new Date().toISOString(),
    readers: []
  };
  arr.push(yeni);
  fs.writeFileSync(DUYURU_FILE, JSON.stringify(arr, null, 2));
  res.status(201).json(yeni);
};

exports.update = (req, res) => {
  let arr = JSON.parse(fs.readFileSync(DUYURU_FILE, 'utf8'));
  const id = +req.params.id;
  const idx = arr.findIndex(d => d.id === id);
  if (idx < 0) return res.status(404).json({ message: 'Duyuru bulunamadı.' });
  if (req.body.text) arr[idx].text = req.body.text;
  if (req.files.image) arr[idx].image = req.files.image[0].filename;
  if (req.files.video) arr[idx].video = req.files.video[0].filename;
  fs.writeFileSync(DUYURU_FILE, JSON.stringify(arr, null, 2));
  res.json(arr[idx]);
};

exports.remove = (req, res) => {
  let arr = JSON.parse(fs.readFileSync(DUYURU_FILE, 'utf8'));
  arr = arr.filter(d => d.id !== +req.params.id);
  fs.writeFileSync(DUYURU_FILE, JSON.stringify(arr, null, 2));
  res.status(204).end();
};

exports.readers = (req, res) => {
  const arr = JSON.parse(fs.readFileSync(DUYURU_FILE, 'utf8'));
  const d = arr.find(d => d.id === +req.params.id);
  if (!d) return res.status(404).end();
  res.json(d.readers || []);
};
