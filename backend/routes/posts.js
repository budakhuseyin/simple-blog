const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/upload");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { createSlug } = require("../utils/slugHelper");

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
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      let slug = createSlug(title);
      let counter = 1;

      // Slug benzersiz mi kontrol et
      while (true) {
        const check = await db.query("SELECT id FROM posts WHERE slug = $1", [slug]);
        if (check.rows.length === 0) break;
        slug = `${createSlug(title)}-${counter}`;
        counter++;
      }

      const query = `
        INSERT INTO posts (title, content, author_id, image_url, category_id, image_public_id, slug, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await db.query(query, [title, content, author_id, imageUrl, category_id, imagePublicId, slug, new Date()]);

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


// 1.5) Editör İçi Resim Yükleme (Quill Image Handler)
router.post("/upload-image", (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err) {
      console.error("Editör resim yükleme hatası:", err);
      return res.status(400).json({ success: false, error: "Resim yüklenemedi." });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Resim seçilmedi." });
      }

      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);

      res.json({
        success: true,
        url: result.secure_url
      });

    } catch (error) {
      console.error("Cloudinary hatası:", error);
      res.status(500).json({ success: false, error: "Sunucu hatası." });
    }
  });
});

// 2) Blogları Listele (Kategori filtresi opsiyonel)
router.get("/", async (req, res) => {
  try {
    const categoryId = req.query.category;
    let sql = `
      SELECT posts.id, posts.title, posts.content, posts.author_id, posts.created_at, posts.image_url, posts.category_id, posts.slug, users.username AS author_name
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
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
    const param = req.params.id;
    let sql = "";
    let queryParams = [];

    // Eğer parametre sayı ise ID ile ara, değilse Slug ile ara
    if (!isNaN(param)) {
      sql = `
        SELECT posts.id, posts.title, posts.content, posts.author_id, posts.created_at, posts.image_url, posts.category_id, posts.slug, users.username AS author_name
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        WHERE posts.id = $1
      `;
      queryParams = [param];
    } else {
      sql = `
        SELECT posts.id, posts.title, posts.content, posts.author_id, posts.created_at, posts.image_url, posts.category_id, posts.slug, users.username AS author_name
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        WHERE posts.slug = $1
      `;
      queryParams = [param];
    }

    const result = await db.query(sql, queryParams);

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
    // Önce postun içeriğini ve kapak resmini al
    const result = await db.query("SELECT content, image_public_id FROM posts WHERE id = $1", [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog bulunamadı." });
    }

    const { content, image_public_id } = result.rows[0];

    // 1. Kapak resmini sil (varsa)
    if (image_public_id) {
      await cloudinary.uploader.destroy(image_public_id);
      console.log("Kapak resmi silindi:", image_public_id);
    }

    // 2. İçerikteki editör resimlerini bul ve sil
    if (content) {
      console.log("-------------------------------------------------");
      console.log("DELETE REQUEST: İçerik resimleri taranıyor...");

      // HTML Entity Decode (Quill Fix)
      const decodedContent = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

      // Regex güncellemesi: src etrafındaki boşluklara ve büyük/küçük harfe duyarlı
      const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
      let match;
      const publicIdsToDelete = [];

      while ((match = imgRegex.exec(decodedContent)) !== null) {
        const src = match[1];
        console.log("Bulunan resim SRC:", src);

        // Sadece bizim Cloudinary hesabımızdaki resimler (blog_images klasörü)
        if (src.includes("cloudinary.com") && src.includes("blog_images/")) {
          try {
            const urlParts = src.split('/');
            const fileNameWithExt = urlParts[urlParts.length - 1];
            const lastDotIndex = fileNameWithExt.lastIndexOf(".");

            if (lastDotIndex !== -1) {
              const fileName = fileNameWithExt.substring(0, lastDotIndex);
              const publicId = `blog_images/${fileName}`;
              publicIdsToDelete.push(publicId);
              console.log("   -> Silinecek Public ID:", publicId);
            } else {
              console.log("   -> Uzantı bulunamadı, atlanıyor:", fileNameWithExt);
            }
          } catch (parseErr) {
            console.error("   -> URL parse hatası:", src, parseErr);
          }
        } else {
          console.log("   -> Cloudinary resmi değil veya blog_images klasöründe değil.");
        }
      }

      if (publicIdsToDelete.length > 0) {
        console.log("-------------------------------------------------");
        console.log(`Toplam ${publicIdsToDelete.length} adet resim silinecek:`, publicIdsToDelete);

        // Her birini sil ve sonucu logla
        for (const id of publicIdsToDelete) {
          try {
            const deleteResult = await cloudinary.uploader.destroy(id);
            console.log(`  [${id}] Result:`, deleteResult);
            if (deleteResult.result === 'ok') {
              console.log(`    ✅ Silindi`);
            } else if (deleteResult.result === 'not found') {
              console.log(`    ⚠️ Bulunamadı (zaten silinmiş olabilir)`);
            } else {
              console.log(`    ❓ Beklenmeyen sonuç: ${deleteResult.result}`);
            }
          } catch (deleteErr) {
            console.error(`  [${id}] ❌ Silme hatası:`, deleteErr.message);
          }
        }

        console.log("✅ Tüm içerik resimleri işlendi.");
        console.log("-------------------------------------------------");
      } else {
        console.log("⚠️ Silinecek içerik resmi bulunamadı.");
        console.log("-------------------------------------------------");
      }
    }

    // 3. Veritabanından postu sil
    await db.query("DELETE FROM posts WHERE id = $1", [postId]);

    res.json({ success: true, message: "Blog ve tüm resimleri başarıyla silindi!" });

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

        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
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
