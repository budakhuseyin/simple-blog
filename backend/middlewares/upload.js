const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const streamifier = require("streamifier");

dotenv.config();

// ✅ Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const heicConvert = require("heic-convert");

const path = require("path");

// ✅ Sadece resim dosyalarına izin ver
const fileFilter = (req, file, cb) => {
  console.log("Yüklenen dosya türü:", file.mimetype); // Debug için log
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/heic", "image/heif"];
  const ext = path.extname(file.originalname).toLowerCase();

  // HEIC bazen application/octet-stream olarak gelebilir, uzantıyı kontrol et
  if (allowedTypes.includes(file.mimetype) || (file.mimetype === "application/octet-stream" && (ext === ".heic" || ext === ".heif"))) {
    cb(null, true);
  } else {
    cb(new Error(`Lütfen geçerli bir resim dosyası yükleyin! (Algılanan tür: ${file.mimetype})`), false);
  }
};

// ✅ Multer yapılandırması (memoryStorage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (HEIC büyük olabilir)
});

// ✅ Cloudinary'ye yükleme fonksiyonu
const uploadToCloudinary = (fileBuffer, filename, mimetype) => {
  return new Promise(async (resolve, reject) => {
    try {
      let bufferToUpload = fileBuffer;
      const ext = path.extname(filename).toLowerCase();

      // HEIC ise JPEG'e çevir
      if (
        mimetype === "image/heic" ||
        mimetype === "image/heif" ||
        ((mimetype === "application/octet-stream") && (ext === ".heic" || ext === ".heif"))
      ) {
        console.log("HEIC formatı algılandı, JPEG'e dönüştürülüyor...");
        bufferToUpload = await heicConvert({
          buffer: fileBuffer,
          format: "JPEG",
          quality: 0.8
        });
        filename = filename.replace(/\.(heic|heif)$/i, ".jpg"); // Uzantıyı güncelle
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "blog_images",
          public_id: `${filename.split('.')[0]}_${Date.now()}` // Benzersiz ID için timestamp ekle
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(bufferToUpload).pipe(stream);
    } catch (error) {
      console.error("Dönüştürme/Yükleme Hatası:", error);
      reject(error);
    }
  });
};

module.exports = { upload, uploadToCloudinary };
