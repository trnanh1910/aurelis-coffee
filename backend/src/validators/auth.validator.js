const { body } = require('express-validator');
exports.loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Vui lòng nhập email hợp lệ'),
  body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
];
exports.registerRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Họ tên phải từ 2 đến 120 ký tự'),
  body('email').isEmail().normalizeEmail().withMessage('Vui lòng nhập email hợp lệ'),
  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ min: 9, max: 20 })
    .withMessage('Số điện thoại phải từ 9 đến 20 ký tự'),
  body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
];
exports.changePasswordRules = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu hiện tại phải có ít nhất 8 ký tự'),
  body('newPassword').isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự'),
];
exports.profileRules = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Họ tên phải từ 2 đến 120 ký tự'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 9, max: 20 })
    .withMessage('Số điện thoại phải từ 9 đến 20 ký tự'),
];
