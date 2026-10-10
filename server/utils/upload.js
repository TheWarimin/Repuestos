const multer = require('multer');

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG y WebP'), false);
  }
};

// Se guarda en memoria y el controlador la persiste en PostgreSQL
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { upload };
