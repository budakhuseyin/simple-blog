const express = require("express");
const router = express.Router();
const db = require('../config/db');

// ✅ 1. Belirli bir blog yazısına ait yorumları getir
router.get("/", async (req, res) => {
    const postId = req.query.post_id;
    if (!postId) return res.status(400).json({ error: "post_id gerekli" });

    try {
        const result = await db.query(
            "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC",
            [postId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Yorumları çekerken hata:", err);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
});

// ✅ 2. Yorum ekle
router.post("/", async (req, res) => {
    const { post_id, name, comment } = req.body;

    if (!post_id || !name || !comment) {
        return res.status(400).json({ error: "Tüm alanlar zorunlu" });
    }

    try {
        const result = await db.query(
            "INSERT INTO comments (post_id, name, comment) VALUES ($1, $2, $3) RETURNING id",
            [post_id, name, comment]
        );
        res.status(201).json({ message: "Yorum eklendi", comment_id: result.rows[0].id });
    } catch (err) {
        console.error("Yorum ekleme hatası:", err);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
});

// ✅ 3. Tüm yorumları getir (admin panel için)
router.get("/all", async (req, res) => {
    console.log("🔍 /api/comments/all çalıştı!");

    try {
        const result = await db.query(`
            SELECT id, post_id, name, comment, created_at 
            FROM comments 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Yorum listesi hatası:", err);
        res.status(500).json({ error: "Yorumlar alınamadı." });
    }
});

// ✅ 4. Yorum sil
router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query("DELETE FROM comments WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Yorum bulunamadı." });
        }
        res.json({ message: "Yorum silindi." });
    } catch (err) {
        console.error("Yorum silme hatası:", err);
        res.status(500).json({ error: "Yorum silinemedi." });
    }
});

// ✅ 5. Yorum güncelle
router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const { name, comment } = req.body;

    if (!name || !comment) {
        return res.status(400).json({ error: "İsim ve yorum boş olamaz." });
    }

    try {
        const result = await db.query(
            "UPDATE comments SET name = $1, comment = $2 WHERE id = $3",
            [name, comment, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Yorum bulunamadı." });
        }

        res.json({ message: "Yorum güncellendi." });
    } catch (err) {
        console.error("Yorum güncelleme hatası:", err);
        res.status(500).json({ error: "Güncelleme başarısız." });
    }
});

module.exports = router;
