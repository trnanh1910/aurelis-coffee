const svc = require('../services/category.service');
const { success } = require('../utils/apiResponse');
const ah = require('../middlewares/asyncHandler');
exports.list = ah(async (_req, res) =>
  success(res, { message: 'Lấy danh sách danh mục thành công', data: await svc.list() }),
);
exports.detail = ah(async (req, res) =>
  success(res, {
    message: 'Lấy thông tin danh mục thành công',
    data: await svc.detail(req.params.id),
  }),
);
exports.create = ah(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo danh mục thành công',
    data: await svc.create(req.body),
  }),
);
exports.update = ah(async (req, res) =>
  success(res, {
    message: 'Cập nhật danh mục thành công',
    data: await svc.update(req.params.id, req.body),
  }),
);
exports.remove = ah(async (req, res) => {
  await svc.remove(req.params.id);
  success(res, { message: 'Xóa danh mục thành công' });
});
