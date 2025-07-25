const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(express.json());
const uretim  = require("./routes/uretim");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/personel', require('./routes/personel'));
app.use('/api/duyurular', require('./routes/duyuru'));
app.use('/api/ozluk', require('./routes/ozluk'));
app.use('/api/izin', require('./routes/izin'));
app.use("/api/uretim", uretim);
app.use('/api/iletisim', require('./routes/iletisim')); app.use(express.static('public')); 


app.get('/', (req, res) => res.redirect('/admin/login.html'))
app.get('/personel', (req, res) => res.redirect('/personel/login.html'))
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`halloldu: http://localhost:${PORT}`));
