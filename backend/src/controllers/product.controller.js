const svc = require('../services/product.service');
const { success } = require('../utils/apiResponse');
const ah = require('../middlewares/asyncHandler');
exports.list = ah(async (req, res) => {
  const r = await svc.list(req.query);
  success(res, {
    message: 'Lấy danh sách sản phẩm thành công',
    data: r.rows,
    pagination: r.pagination,
  });
});
exports.detail = ah(async (req, res) =>
  success(res, {
    message: 'Lấy thông tin sản phẩm thành công',
    data: await svc.detail(req.params.id),
  }),
);
exports.create = ah(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo sản phẩm thành công',
    data: await svc.create(req.body, req.file ? `/uploads/${req.file.filename}` : null),
  }),
);
exports.update = ah(async (req, res) =>
  success(res, {
    message: 'Cập nhật sản phẩm thành công',
    data: await svc.update(
      req.params.id,
      req.body,
      req.file ? `/uploads/${req.file.filename}` : null,
    ),
  }),
);
exports.remove = ah(async (req, res) => {
  await svc.remove(req.params.id);
  success(res, { message: 'Ngừng kinh doanh sản phẩm thành công' });
});
