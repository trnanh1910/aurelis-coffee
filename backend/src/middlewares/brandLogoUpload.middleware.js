const multer = require('multer');
const AppError = require('../utils/AppError');

const uploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'image/svg+xml') {
      return callback(new AppError('Chỉ nhận logo định dạng SVG.', 400));
    }
    callback(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

module.exports = (req, res, next) => {
  uploader.single('logo')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return next(new AppError('Tệp SVG cần nhỏ hơn 2 MB.', 413));
    }
    next(error);
  });
};
