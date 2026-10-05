const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype))
    return cb(new AppError('Chỉ chấp nhận hình ảnh JPG, PNG và WEBP', 400));
  cb(null, true);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
