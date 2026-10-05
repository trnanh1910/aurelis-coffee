const service = require('../services/branch.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');

exports.list = asyncHandler(async (_req, res) =>
  success(res, { message: 'Lấy danh sách chi nhánh thành công', data: await service.list() }),
);
exports.detail = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Lấy thông tin chi nhánh thành công',
    data: await service.detail(req.params.id),
  }),
);
exports.create = asyncHandler(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo chi nhánh thành công',
    data: await service.create({
      ...req.body,
      ...(req.file ? { image: `/uploads/${req.file.filename}` } : {}),
    }),
  }),
);
exports.update = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Cập nhật chi nhánh thành công',
    data: await service.update(req.params.id, {
      ...req.body,
      ...(req.file ? { image: `/uploads/${req.file.filename}` } : {}),
    }),
  }),
);
exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  success(res, { message: 'Xóa chi nhánh thành công' });
});
