const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1) Tüm kategorileri listele
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Kategori sorgusu hatası:", error);
    res.status(500).json({ error: "Sunucu hatası!" });
  }
});

// 2) Yeni kategori ekle
router.post("/add", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Kategori adı gerekli!" });
  }
  try {
    await db.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.json({ success: true, message: "Kategori başarıyla eklendi!" });
  } catch (error) {
    console.error("Kategori ekleme hatası:", error);
    res.status(500).json({ error: "Kategori eklenirken hata oluştu!" });
  }
});

// 3) Kategori silme
router.delete("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    await db.query("DELETE FROM categories WHERE id = $1", [categoryId]);
    res.json({ success: true, message: "Kategori başarıyla silindi!" });
  } catch (error) {
    console.error("Kategori silme hatası:", error);
    res.status(500).json({ error: "Kategori silinirken hata oluştu!" });
  }
});

// 4) Kategori güncelleme
router.put("/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Kategori adı gerekli!" });
  }
  try {
    await db.query("UPDATE categories SET name = $1 WHERE id = $2", [name, categoryId]);
    res.json({ success: true, message: "Kategori başarıyla güncellendi!" });
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error);
    res.status(500).json({ error: "Kategori güncellenirken hata oluştu!" });
  }
});

module.exports = router;
