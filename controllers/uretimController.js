const fs         = require("fs");
const path       = require("path");
const { v4: uuid } = require("uuid");

const kartPath  = path.join(__dirname, "../data/uretim_kartlari.json");
const raporPath = path.join(__dirname, "../data/uretim_raporlari.json");

// In‑memory tracking of ongoing jobs
const inProgress = {};

// Helpers
function readJson(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────────

// Yeni bir üretim kartı oluşturur
exports.kartOlustur = (req, res) => {
  const { ad, hedef, aciklama } = req.body;
  if (!ad || !hedef) return res.status(400).json({ hata: "Ad ve hedef zorunlu" });

  const kartlar = readJson(kartPath);
  kartlar.push({
    id: uuid(),
    ad,
    hedef: parseInt(hedef, 10),
    tamamlandi: false,
    aktif: true,
    aciklama: aciklama || "",
    topAdet: 0,
    kalan: parseInt(hedef, 10)
  });
  writeJson(kartPath, kartlar);
  res.json({ mesaj: "Kart oluşturuldu" });
};

// Tüm üretim kartlarını getirir
exports.kartlariGetir = (req, res) => {
  res.json(readJson(kartPath));
};

// Kartın aktif/pasif durumunu tersine çevirir
exports.kartDurumGuncelle = (req, res) => {
  const kartlar = readJson(kartPath);
  const k = kartlar.find(x => x.id === req.params.id);
  if (!k) return res.status(404).json({ hata: "Kart bulunamadı" });
  k.aktif = !k.aktif;
  writeJson(kartPath, kartlar);
  res.json({ mesaj: "Durum güncellendi", kart: k });
};

// Kartı siler
exports.kartSil = (req, res) => {
  const arr = readJson(kartPath).filter(x => x.id !== req.params.id);
  writeJson(kartPath, arr);
  res.json({ mesaj: "Kart silindi" });
};

// Kartı tamamlandı olarak işaretler
exports.kartTamamla = (req, res) => {
  const kartlar = readJson(kartPath);
  const k = kartlar.find(x => x.id === req.params.id);
  if (!k) return res.status(404).json({ hata: "Kart bulunamadı" });

  // Toggle
  if (k.tamamlandi) {
    // tekrar açılırken sayaçları sıfırla
    k.tamamlandi = false;
    k.topAdet    = 0;
    k.kalan      = k.hedef;
  } else {
    k.tamamlandi = true;
  }

  writeJson(kartPath, kartlar);
  res.json({ mesaj: `Kart ${k.tamamlandi ? "tamamlandı" : "açıldı"}`, kart: k });
};

// İstatistik: özet + detay
exports.istatistikGetir = (req, res) => {
  const { yil, ay, kartId, personelId } = req.query;
  const raporlar = readJson(raporPath);
  const kartlar  = readJson(kartPath);

  // 1) Filtre
  const filt = raporlar.filter(r => {
    const d = new Date(r.tarih);
    return (!yil         || d.getFullYear() == yil)
        && (!ay          || d.getMonth()+1 == ay)
        && (!kartId      || r.kartId == kartId)
        && (!personelId || r.personelId == personelId);
  });

  // 2) Verim oranları
  const rates = filt.map(r => ({
    ...r,
    rate: r.sure > 0 ? (r.adet / r.sure) : 0
  }));

  // 3) Global ort. hız kart bazında
  const globalRuns = kartId
    ? raporlar.filter(r => r.kartId == kartId)
    : raporlar;
  const avgByCard = {};
  globalRuns.forEach(r => {
    const rate = r.sure > 0 ? (r.adet / r.sure) : 0;
    if (!avgByCard[r.kartId]) avgByCard[r.kartId] = { sum:0, count:0 };
    avgByCard[r.kartId].sum   += rate;
    avgByCard[r.kartId].count += 1;
  });
  Object.keys(avgByCard).forEach(kid => {
    avgByCard[kid] = avgByCard[kid].sum / avgByCard[kid].count;
  });

  // 4) Detay satırları
  const detay = rates.map(r => {
  // Öncelik: rapordaki kartAd, yoksa kartlar.json’dan bul, yoksa "(Silinen Kart)"
  let kartAd = r.kartAd;
  if (!kartAd) {
    const kart = kartlar.find(k => k.id === r.kartId);
    kartAd = kart ? kart.ad : "(Silinen Kart)";
  }
  return {
    kartId:     r.kartId,
    kartAd:     kartAd,
    personelId: r.personelId,
    personelAd: r.personelAd || "—",
    adet:       r.adet,
    sure:       r.sure,
    verim:      Math.round(((r.rate) / (avgByCard[r.kartId] || 1)) * 100),
    aciklama:   r.aciklama   || "—",
    tarih:      r.tarih
  };
});

  // 5) Özet
  const topAdet  = detay.reduce((s, r) => s + r.adet, 0);
  const topSure  = detay.reduce((s, r) => s + r.sure, 0);
  const avgVerim = detay.length
    ? Math.round(detay.reduce((s, r) => s + r.verim, 0) / detay.length)
    : 0;

  res.json({
    ozet: {
      totalCards:     kartId ? 1 : kartlar.length,
      totalReports:   detay.length,
      completedCards: kartlar.filter(k => k.tamamlandi).length,
      topAdet,
      topSure,
      verimlilik: avgVerim
    },
    detay
  });
};

// ─── PERSONEL ──────────────────────────────────────────────────────────────────

// Aktif (tamamlanmamış & pasif değil) kartları getirir
exports.aktifKartlariGetir = (req, res) => {
  const kartlar = readJson(kartPath)
    .filter(k => k.aktif && !k.tamamlandi);
  res.json(kartlar);
};

// Aktif iş bilgisini döner
exports.getInProgress = (req, res) => {
  const job = inProgress[req.personel.id];
  if (!job) return res.status(404).json({ hata: "Aktif iş yok" });
  res.json(job);
};

// İş başlat
exports.isBaslat = (req, res) => {
  const personelId = req.personel.id;
  if (inProgress[personelId]) {
    return res.status(400).json({ hata: "Zaten aktif işiniz var" });
  }

  const personelAd = req.personel.ad || req.personel.soyad || "";
  const { kartId } = req.body;
  if (!kartId) return res.status(400).json({ hata: "Kart ID gerekli" });

  const kartlar = readJson(kartPath);
  const k = kartlar.find(k => k.id === kartId) || {};

  inProgress[personelId] = {
    kartId,
    kartAd:    k.ad     || "—",
    personelAd,
    startTs:   Date.now(),
    breaks:    []
  };
  res.json({ mesaj: "Başlatıldı" });
};

// İş durdur
exports.isDurdur = (req, res) => {
  const personelId = req.personel.id;
  const job = inProgress[personelId];
  if (!job) return res.status(400).json({ hata: "Aktif iş yok" });
  job.breaks.push({ tip: req.body.tip || "diger", ts: Date.now() });
  res.json({ mesaj: "Durduruldu" });
};

// İşe devam
exports.isDevamet = (req, res) => {
  res.json({ mesaj: "Devam edildi" });
};

// Kayıt oluştur
exports.uretimKaydet = (req, res) => {
  const personelId = req.personel.id;
  const job = inProgress[personelId];
  if (!job) return res.status(400).json({ hata: "Aktif iş yok" });

  const { adet, aciklama } = req.body;
  if (!adet) return res.status(400).json({ hata: "Adet girin" });

  const now     = Date.now();
  const totalMs = now - job.startTs;
  const breakMs = job.breaks.reduce((sum, b, i, arr) => {
    const next = arr[i+1]?.ts || now;
    return sum + (next - b.ts);
  }, 0);
  const sure    = Math.round((totalMs - breakMs) / 60000);

  const raporlar = readJson(raporPath);
  raporlar.push({
    id:         uuid(),
    kartId:     job.kartId,
    kartAd:     job.kartAd,
    personelId,
    personelAd: job.personelAd,
    adet:       parseInt(adet,10),
    sure,
    molalar:    job.breaks,
    tarih:      new Date().toISOString(),
    aciklama:   aciklama || ""
  });
  writeJson(raporPath, raporlar);

  // Kart toplamlarını güncelle
  const kartlar = readJson(kartPath);
  const k = kartlar.find(x => x.id === job.kartId);
  if (k) {
    k.topAdet = (k.topAdet||0) + parseInt(adet,10);
    k.kalan   = Math.max(0, k.hedef - k.topAdet);
    if (k.topAdet >= k.hedef) k.tamamlandi = true;
    writeJson(kartPath, kartlar);
  }

  delete inProgress[personelId];
  res.json({ mesaj: "Kaydedildi" });
};

// Kişinin geçmiş kayıtlarını getir
exports.kayitlariGetir = (req, res) => {
  const personelId = req.personel.id;
  const raporlar = readJson(raporPath)
    .filter(r => r.personelId == personelId)
    .map(r => {
      const kart = readJson(kartPath).find(k => k.id === r.kartId) || {};
      const verim = r.sure > 0
        ? Math.min(100, Math.round((r.adet/(r.sure/60))*100))
        : 0;
      return {
        ...r,
        urun: kart.ad || "—",
        verim
      };
    });
  res.json(raporlar);
};

// Geçmişte raporlanmış tüm kartları benzersiz olarak döner
exports.raporKartlariGetir = (req, res) => {
  const raporlar = readJson(raporPath);
  const map = {};
  raporlar.forEach(r => {
    if (r.kartId && r.kartAd) map[r.kartId] = r.kartAd;
  });
  const liste = Object.entries(map).map(([id, ad]) => ({ id, ad }));
  res.json(liste);
};
