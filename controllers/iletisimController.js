const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/iletisim.json');

exports.create = (req,res) => {
  const { tur, mesaj } = req.body;
  if(!tur || !mesaj) return res.status(400).json({ message: "Tür ve mesaj zorunlu!" });
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
  const yeni = {
    id: Date.now(),
    tarih: new Date().toISOString(),
    tur, mesaj, okundu: false
  };
  list.push(yeni);
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  res.json({ message: "Mesaj iletildi." });
};

exports.list = (req,res) => {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
  res.json(list.sort((a,b)=>b.id-a.id));
};

exports.okunduYap = (req,res) => {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
  const i = list.find(m => String(m.id) === String(req.params.id));
  if(i) i.okundu = true;
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  res.json({ message: "Okundu olarak işaretlendi." });
};

exports.sil = (req,res) => {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
  list = list.filter(m => String(m.id) !== String(req.params.id));
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  res.json({ message: "Silindi." });
};
