// .env yüklemesi en başta olmalı
require("dotenv").config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const postsRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const categoriesRoutes = require('./routes/categories');
const commentsRoutes = require('./routes/comments.routes');

const app = express();

// İstekleri logla (geliştirme için)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Statik klasörler

// Cloudinary’e geçtik ama eski resimler için gerekebilir
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public folder for static files (robots.txt, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Diğer frontend klasörleri
app.use('/assets', express.static(path.resolve(__dirname, '../assets')));
app.use('/user', express.static(path.resolve(__dirname, '../user')));
app.use('/components', express.static(path.resolve(__dirname, '../components')));
app.use('/styles', express.static(path.resolve(__dirname, '../styles')));
app.use('/admin', express.static(path.resolve(__dirname, '../admin')));

// ✅ API route’ları
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/contact', require('./routes/contact'));

// ✅ SEO Routes
const sitemapRoutes = require('./routes/sitemap');
app.use('/', sitemapRoutes); // Serves /sitemap.xml

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error("Sunucu Hatası:", err);
  res.status(500).json({ error: "Sunucu hatası oluştu. Lütfen tekrar deneyin." });
});

// Basit test endpointleri
app.get("/test", (req, res) => {
  res.send("Server çalışıyor!");
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'connected', time: result.rows[0].now });
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 404 Handler - Must be last route
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, '../user/404.html'));
});

// Server başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT} portunda çalışıyor...`));
