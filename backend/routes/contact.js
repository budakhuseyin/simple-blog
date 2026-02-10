
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');

// 📩 1. Yeni Mesaj Gönder (Kullanıcı)
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Tüm alanları doldurunuz." });
    }

    try {
        // 1️⃣ Veritabanına Kaydet
        await db.query(
            "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)",
            [name, email, message]
        );

        // 2️⃣ E-posta Gönder (Admin'e Bildirim)
        console.log("E-posta gönderimi başlıyor...");
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log(`E-posta yapılandırması: User=${process.env.EMAIL_USER}, Pass=${process.env.EMAIL_PASS ? '********' : 'EKSİK'}`);

            const transporter = nodemailer.createTransport({
                service: 'gmail', // Built-in service configuration
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false // Render/Cloud ortamlarında SSL hatalarını önler
                },
                connectionTimeout: 10000 // 10 seconds timeout
            });

            const mailOptions = {
                from: `"Blog İletişim" <${process.env.EMAIL_USER}>`,
                to: 'huseyinbudak904@gmail.com',
                replyTo: email, // Gönderen kişinin mailine yanıt verilebilsin
                subject: `Yeni Mesaj: ${name}`,
                text: `Gönderen: ${name} (${email})\n\nMesaj:\n${message}`
            };

            // Send mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("❌ E-POSTA HATASI:", error);
                } else {
                    console.log('✅ E-posta gönderildi:', info.messageId);
                }
            });
        } else {
            console.warn("⚠️ E-posta ayarları (EMAIL_USER veya EMAIL_PASS) bulunamadı!");
        }

        res.status(201).json({ message: "Mesajınız başarıyla gönderildi." });

    } catch (err) {
        console.error("İletişim hatası:", err);
        res.status(500).json({ error: "Sunucu hatası, lütfen tekrar deneyin." });
    }
});

// 📂 2. Mesajları Getir (Filtreli: Gelen Kutusu / Arşiv)
router.get('/', async (req, res) => {
    const { type } = req.query; // 'inbox' veya 'archive'
    try {
        let query = "SELECT * FROM messages WHERE is_archived = $1 ORDER BY created_at DESC";
        let isArchived = type === 'archive'; // type 'archive' ise true, değilse false (inbox)

        const result = await db.query(query, [isArchived]);
        res.json(result.rows);
    } catch (err) {
        console.error("Mesajlar alınamadı:", err);
        res.status(500).json({ error: "Veritabanı hatası." });
    }
});

// 📂 3. Mesajı Arşivle / Geri Al
router.put('/:id/archive', async (req, res) => {
    const { id } = req.params;
    const { archived } = req.body; // true (arşivle) veya false (geri al)

    try {
        await db.query("UPDATE messages SET is_archived = $1 WHERE id = $2", [archived, id]);
        res.json({ message: "Mesaj durumu güncellendi." });
    } catch (err) {
        console.error("Arşivleme hatası:", err);
        res.status(500).json({ error: "İşlem başarısız." });
    }
});

// 📂 4. Mesajı Sil
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM messages WHERE id = $1", [id]);
        res.json({ message: "Mesaj silindi." });
    } catch (err) {
        console.error("Silme hatası:", err);
        res.status(500).json({ error: "Silme işlemi başarısız." });
    }
});

module.exports = router;
