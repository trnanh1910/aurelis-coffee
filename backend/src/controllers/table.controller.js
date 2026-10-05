const service = require('../services/table.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
exports.list = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Lấy danh sách bàn thành công',
    data: await service.list(req.query, req.user),
  }),
);
exports.detail = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Lấy thông tin bàn thành công',
    data: await service.detail(req.params.id, req.user),
  }),
);
exports.create = asyncHandler(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo bàn thành công',
    data: await service.create(req.body, req.user),
  }),
);
exports.update = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Cập nhật bàn thành công',
    data: await service.update(req.params.id, req.body, req.user),
  }),
);
exports.changeStatus = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Cập nhật trạng thái bàn thành công',
    data: await service.changeStatus(req.params.id, req.body.status, req.user),
  }),
);
