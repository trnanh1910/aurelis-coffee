const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_req, file, cb) =>
    cb(
      null,
      `branch-${Date.now()}-${Math.round(Math.random() * 1e6)}${extensions[file.mimetype] || '.img'}`,
    ),
});
module.exports = multer({
  storage,
  fileFilter: (_req, file, cb) =>
    extensions[file.mimetype]
      ? cb(null, true)
      : cb(new AppError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP', 400)),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('imageFile');
