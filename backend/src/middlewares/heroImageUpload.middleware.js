const multer = require('multer');
const AppError = require('../utils/AppError');

const uploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'image/webp') {
      return callback(new AppError('Ảnh nền cần được tải lên ở định dạng WEBP.', 400));
    }
    callback(null, true);
  },
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
});

module.exports = (req, res, next) => {
  uploader.single('image')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return next(new AppError('Ảnh nền cần nhỏ hơn 6 MB sau khi tối ưu.', 413));
    }
    next(error);
  });
};
