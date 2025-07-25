# Enterprise Personnel & Admin Panel

Modern, kurumsal şirketler için geliştirilmiş **personel ve yönetici paneli**.  
Hem personel tarafı hem de admin paneli içerir. Tamamen responsive (mobil uyumlu) ve gerçek kurumsal ihtiyaçlara göre tasarlanmıştır.
## Özellikler
- **Personel Portalı:**
  - Üretim kartı başlatma, üretim adedi ve açıklama girme
  - Canlı süre ve mola yönetimi
  - İzin talepleri (dosya yüklemeli)
  - Geçmiş izin ve üretim kayıtları
  - Duyurular
  - Görüş / Öneri / Şikayet gönderimi

- **Admin Paneli:**
  - Dashboard (istatistik kartları)
  - Personel yönetimi (ekle, düzenle, sil)
  - Özlük belgeleri yönetimi (dosya yükleme)
  - İzin talepleri yönetimi ve onay/ret
  - Üretim kartları oluşturma ve yönetme (aktif/pasif, tamamla/yeni aç)
  - Üretim raporları ve verimlilik analizi
  - Duyuru ekleme, görsel/video ile paylaşım
  - İletişim kutusu (görüş/öneri/şikayet okuma)
  - 
 - **Güvenlik:**
  - JWT tabanlı kimlik doğrulama
  - Yetki kontrolleri (personel/admin)
  - Kullanıcı işlemleri tamamen API üzerinden

## Kullanılan Teknolojiler

- **Backend:** Node.js (Express)
- **Veri Saklama:** JSON dosyaları ile dosya tabanlı kayıt
- **Frontend:** HTML, TailwindCSS, vanilla JS 
- **Paketler:** bcrypt, jsonwebtoken, multer, cors, body-parser
- **Mobil Uyum:** Tüm arayüzler tam responsive

## Kurulum ve Çalıştırma

1. **Proje dosyalarını klonlayın veya indirin**
2. Ana dizinde terminal açın:
   ```bash
    
   npm install
   npm start
   node server.js

Personel Girişi:
http://localhost:3000/personel
Admin Girişi:
http://localhost:3000/
//ekran görüntüleri           
![Personel](./docs/personel-mobil.png) | ![Admin](./docs/admin-desktop.png) 

Katkı ve Lisans
Kod tamamen geliştiriciye aittir, isteğe göre uyarlanabilir.

Lisans: MIT

Hazırlayan:
Seyfettin Gök

