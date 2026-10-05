const { body } = require('express-validator');
exports.productRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Tên sản phẩm phải từ 2 đến 150 ký tự'),
  body('productCode')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Mã sản phẩm phải từ 2 đến 30 ký tự'),
  body('categoryId').isInt({ min: 1 }).withMessage('Danh mục không hợp lệ'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Giá sản phẩm phải lớn hơn hoặc bằng 0'),
];
