// controllers/izinController.js
const fs = require('fs');
const path = require('path');
const izinFile = path.join(__dirname, '../data/izin.json');
const personelFile = path.join(__dirname, '../data/personel.json');
const izinTurleriFile = path.join(__dirname, '../data/izinTurleri.json');

// Tüm izin türlerini oku
function getIzinTurleri() {
  return JSON.parse(fs.readFileSync(izinTurleriFile, 'utf8'));
}

// Admin: Tüm izinleri listele
exports.list = (req, res) => {
  const izinler = JSON.parse(fs.readFileSync(izinFile, 'utf8'));
  res.json(izinler);
};

// Personel: Sadece kendi izinlerini listele
exports.listByPersonel = (req, res) => {
  const izinler = JSON.parse(fs.readFileSync(izinFile, 'utf8'));
  const myList = izinler.filter(i => i.personelId == req.personel.id);
  res.json(myList);
};

// Personel: Yeni izin talebi oluştur (form-data ile dosya destekli)
exports.create = (req, res) => {
  const { tur, baslangic, bitis, gerekce, neden } = req.body;
  const aciklama = gerekce || neden;
  if (!tur || !baslangic || !bitis)
    return res.status(400).json({ message: "Tüm alanlar zorunlu!" });

  const izinTurleri = getIzinTurleri();
  const tanimliTur = izinTurleri.find(t => t.key === tur);
  if (!tanimliTur)
    return res.status(400).json({ message: "Geçersiz izin türü." });

  // Kaç gün istendi hesapla
  const gun = Math.max(1, Math.ceil((new Date(bitis) - new Date(baslangic)) / (1000*60*60*24)) + 1);

  // Kalan hakları bulmak için geçmiş onaylı izinleri topla
  let izinler = JSON.parse(fs.readFileSync(izinFile, 'utf8'));
  let onayliGun = izinler
    .filter(i => i.personelId == req.personel.id && i.tur === tur && i.durum === "Onaylandı")
    .reduce((sum, i) => sum + (i.gun || 0), 0);
  let kalan = tanimliTur.toplam - onayliGun;

  if (tanimliTur.toplam > 0 && gun > kalan) {
    return res.status(400).json({ message: `Kalan ${tanimliTur.ad} izniniz: ${kalan} gün.` });
  }

  // Dosya varsa kaydet
  let dosya = null;
  if (req.file) dosya = req.file.filename;

  const yeniIzin = {
    id: Date.now(),
    personelId: req.personel.id,
    tur,
    baslangic,
    bitis,
    gun,
    gerekce: aciklama,
    belge: dosya,
    durum: "Beklemede",
    tarih: new Date().toISOString(),
    onaylayan: null
  };

  izinler.push(yeniIzin);
  fs.writeFileSync(izinFile, JSON.stringify(izinler, null, 2));
  res.json({ message: "İzin talebiniz kaydedildi, yönetici onayını bekliyor." });
};

// Admin: İzin durumunu güncelle (Onayla/Reddet)
exports.updateStatus = (req, res) => {
  let izinler = JSON.parse(fs.readFileSync(izinFile, 'utf8'));
  let izin = izinler.find(i => i.id == req.params.id);
  if (!izin) return res.status(404).json({ message: "İzin bulunamadı." });

  const { durum } = req.body; // "Onaylandı", "Reddedildi"
  if (!["Onaylandı", "Reddedildi"].includes(durum))
    return res.status(400).json({ message: "Geçersiz durum." });

  if (izin.durum !== "Beklemede")
    return res.status(400).json({ message: "Bu izin zaten işlenmiş." });

  izin.durum = durum;
  izin.onaylayan = req.admin ? req.admin.ad : "admin";
  izin.onayTarihi = new Date().toISOString();

  fs.writeFileSync(izinFile, JSON.stringify(izinler, null, 2));
  res.json({ message: "İzin durumu güncellendi." });
};

// Personel ve Admin: Kalan hakları getir
// Personel ve Admin: Kalan hakları getir
exports.getKalanHaklar = (req, res) => {
  const izinTurleri = getIzinTurleri();
  const izinler = JSON.parse(fs.readFileSync(izinFile, 'utf8'));
  let personelId = null;

  // /kalan (personel) veya /kalan/:id (admin)
  if (req.personel) {
    personelId = req.personel.id + "";
  } else if (req.params.id) {
    personelId = req.params.id + "";
  } else if (req.query.personelId) {
    personelId = req.query.personelId + "";
  } else {
    return res.status(400).json({ message: "Personel ID yok!" });
  }



  let kalanlar = {};
  izinTurleri.forEach(tur => {
    const kullanilan = izinler
      .filter(i => (i.personelId + "") === personelId && i.tur === tur.key && i.durum === "Onaylandı")
      .reduce((sum, i) => sum + (i.gun || 0), 0);
    kalanlar[tur.ad] = tur.toplam - kullanilan;
  });

  return res.json(kalanlar);
};
