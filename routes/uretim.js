const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const ctrl    = require("../controllers/uretimController");

// — ADMIN —
router.post("/kart",                   auth.admin, ctrl.kartOlustur);
router.get("/kartlar",                 auth.admin, ctrl.kartlariGetir);
router.post("/kart/:id/durum",         auth.admin, ctrl.kartDurumGuncelle);
router.delete("/kart/:id",             auth.admin, ctrl.kartSil);
router.post("/kart/:id/tamamla",       auth.admin, ctrl.kartTamamla);
router.get("/istatistik",              auth.admin, ctrl.istatistikGetir);
router.get("/raporlar/kartlar",        auth.admin, ctrl.raporKartlariGetir);

// — PERSONEL —
router.get("/personel/aktif",          auth.personel, ctrl.aktifKartlariGetir);
router.get("/personel/inprogress",     auth.personel, ctrl.getInProgress);
router.post("/personel/baslat",        auth.personel, ctrl.isBaslat);
router.post("/personel/durdur",        auth.personel, ctrl.isDurdur);
router.post("/personel/devamet",       auth.personel, ctrl.isDevamet);
router.post("/personel/kayit",         auth.personel, ctrl.uretimKaydet);23
router.get("/personel/kayitlar",       auth.personel, ctrl.kayitlariGetir);

module.exports = router;
