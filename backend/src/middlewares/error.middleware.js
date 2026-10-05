const AppError = require('../utils/AppError');
const notFound = (req, _res, next) =>
  next(new AppError(`Không tìm thấy API: ${req.method} ${req.originalUrl}`, 404));
const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const body = {
    success: false,
    message:
      status === 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ nội bộ' : err.message,
  };
  if (err.details) body.errors = err.details;
  if (process.env.NODE_ENV !== 'production' && status === 500) body.debug = err.code || err.name;
  res.status(status).json(body);
};
module.exports = { notFound, errorHandler };
