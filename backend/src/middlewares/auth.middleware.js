const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Vui lòng đăng nhập để tiếp tục', 401);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
  }
  const [rows] = await pool.execute('SELECT status FROM users WHERE id=? LIMIT 1', [
    payload.userId,
  ]);
  if (!rows[0] || rows[0].status !== 'ACTIVE')
    throw new AppError('Tài khoản hiện không khả dụng', 401);
  const user = await require('../services/auth.service').getUserById(payload.userId);
  req.user = {
    ...user,
    employee_id: user.employeeId,
    customer_id: user.customerId,
    branch_id: user.branchId,
  };
  next();
});

const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new AppError('Bạn không có quyền thực hiện thao tác này', 403));
    next();
  };
module.exports = { protect, authorize };
