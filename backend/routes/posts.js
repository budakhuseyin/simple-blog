const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/upload");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// 1) Blog Ekleme
router.post("/add", (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err && err.message !== "Unexpected field") {
      console.error("Resim yükleme hatası:", err);
      return res.status(400).json({ error: "Dosya yüklenirken hata oluştu." });
    }

    try {
      const { title, content, author_id, category_id } = req.body;
      let imageUrl = "/uploads/default.jpg";
      let imagePublicId = null;

      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      const query = `
        INSERT INTO posts (title, content, author_id, image_url, category_id, image_public_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await db.query(query, [title, content, author_id, imageUrl, category_id, imagePublicId]);

      res.json({
        success: true,
        message: "Blog başarıyla eklendi!",
        imageUrl
      });
    } catch (error) {
      console.error("Veritabanı hatası:", error);
      res.status(500).json({ error: "Veritabanına kayıt eklenirken hata oluştu!" });
    }
  });
});

// 2) Blogları Listele (Kategori filtresi opsiyonel)
router.get("/", async (req, res) => {
  try {
    const categoryId = req.query.category;
    let sql = `
      SELECT id, title, content, author_id, created_at, image_url, category_id
      FROM posts
    `;
    const params = [];

    if (categoryId) {
      sql += " WHERE category_id = $1";
      params.push(categoryId);
    }

    sql += " ORDER BY created_at DESC, id DESC";

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    res.status(500).json({ error: "Veritabanından veri çekilirken hata oluştu!" });
  }
});

// 3) Tekil blog detay
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const sql = `
      SELECT id, title, content, author_id, created_at, image_url, category_id
      FROM posts
      WHERE id = $1
    `;
    const result = await db.query(sql, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog bulunamadı" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tekil blog sorgusu hatası:", err);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});

// 4) Blog Silme
router.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    // Cloudinary görseli sil
    const result = await db.query("SELECT image_public_id FROM posts WHERE id = $1", [postId]);
    const publicId = result.rows[0]?.image_public_id;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary'den silindi:", publicId);
    }

    await db.query("DELETE FROM posts WHERE id = $1", [postId]);
    res.json({ success: true, message: "Blog başarıyla silindi!" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası!" });
  }
});

// 5) Blog Güncelleme (opsiyonel resimli)
router.put("/:id", (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err && err.message !== "Unexpected field") {
      console.error("Resim yükleme hatası:", err);
      return res.status(400).json({ error: "Dosya yüklenirken hata oluştu." });
    }

    const postId = req.params.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Başlık ve içerik gerekli!" });
    }

    try {
      if (req.file) {
        // Eski resmi sil
        const old = await db.query("SELECT image_public_id FROM posts WHERE id = $1", [postId]);
        const oldPublicId = old.rows[0]?.image_public_id;
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log("Eski görsel silindi");
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        const imageUrl = result.secure_url;
        const imagePublicId = result.public_id;

        await db.query(
          "UPDATE posts SET title = $1, content = $2, image_url = $3, image_public_id = $4 WHERE id = $5",
          [title, content, imageUrl, imagePublicId, postId]
        );
      } else {
        await db.query(
          "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
          [title, content, postId]
        );
      }

      res.json({ success: true, message: "Blog başarıyla güncellendi!" });
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      res.status(500).json({ success: false, message: "Sunucu hatası!" });
    }
  });
});

module.exports = router;
