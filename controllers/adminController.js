const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const admins = require('../data/admins.json');
const PERSONEL_FILE = path.join(__dirname, '../data/personel.json');
const JWT_SECRET = 'change_this_to_a_strong_secret';

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = admins.find(a => a.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
};
