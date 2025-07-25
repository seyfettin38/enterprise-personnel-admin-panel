const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PERSONEL_FILE = path.join(__dirname, '../data/personel.json');
const JWT_SECRET = 'change_this_to_a_strong_secret';

// Tüm personelleri listeler (passwordsiz)
exports.list = (req, res) => {
  const list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const safe = list.map(({ passwordHash, ...p }) => p);
  res.json(safe);
};

// Kayıt ol (register)
exports.register = (req, res) => {
  let list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const { ad, soyad, email, password } = req.body;
  if (!ad || !soyad || !email || !password)
    return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
  if (list.find(p => p.email === email))
    return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });
  const hash = bcrypt.hashSync(password, 10);
  const yeni = { id: Date.now(), ad, soyad, email, passwordHash: hash };
  list.push(yeni);
  fs.writeFileSync(PERSONEL_FILE, JSON.stringify(list, null, 2));
  res.json({ message: 'Kayıt başarılı. Giriş yapabilirsiniz.' });
};

// Giriş yap (login)
exports.login = (req, res) => {
  const list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const { email, password } = req.body;
  const me = list.find(p => p.email === email);
  if (!me || !bcrypt.compareSync(password, me.passwordHash)) {
    return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
  }
  const token = jwt.sign({ id: me.id, ad: me.ad, soyad: me.soyad }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
};

// Admin panelinden personel ekle (form-data)
exports.add = (req, res) => {
  let list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const { ad, egitim, gorev, baslama } = req.body;
  if (!ad || !egitim || !gorev || !baslama)
    return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
  const yeni = {
    id: Date.now(),
    ad,
    egitim,
    gorev,
    baslama,
    foto: req.file?.filename || null
  };
  list.push(yeni);
  fs.writeFileSync(PERSONEL_FILE, JSON.stringify(list, null, 2));
  res.json(yeni);
};

// Admin panelinden personel güncelle (form-data)
exports.update = (req, res) => {
  let list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const id = parseInt(req.params.id);
  const ix = list.findIndex(p => p.id === id);
  if (ix === -1) return res.status(404).json({ message: 'Personel bulunamadı.' });
  const p = list[ix];
  list[ix] = {
    ...p,
    ad:      req.body.ad      ?? p.ad,
    egitim:  req.body.egitim  ?? p.egitim,
    gorev:   req.body.gorev   ?? p.gorev,
    baslama: req.body.baslama ?? p.baslama,
    foto:    req.file ? req.file.filename : p.foto
  };
  fs.writeFileSync(PERSONEL_FILE, JSON.stringify(list, null, 2));
  res.json(list[ix]);
};

// Admin panelinden personel sil
exports.remove = (req, res) => {
  let list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const id = parseInt(req.params.id);
  const ix = list.findIndex(p => p.id === id);
  if (ix === -1) return res.status(404).json({ message: 'Personel bulunamadı.' });
  list.splice(ix, 1);
  fs.writeFileSync(PERSONEL_FILE, JSON.stringify(list, null, 2));
  res.json({ message: 'Silindi.' });
};

// Kendi bilgisini getir (JWT token ile kimlik doğrulama)
exports.me = (req, res) => {
  const list = JSON.parse(fs.readFileSync(PERSONEL_FILE, 'utf8'));
  const me = list.find(p => p.id === req.personel.id);
  if (!me) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
  res.json({ id: me.id, ad: me.ad, soyad: me.soyad });
};
