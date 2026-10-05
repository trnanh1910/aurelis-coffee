const service = require('../services/order.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
exports.list = asyncHandler(async (req, res) => {
  const r = await service.list(req.query, req.user);
  success(res, {
    message: 'Lấy danh sách đơn hàng thành công',
    data: r.rows,
    pagination: r.pagination,
  });
});
exports.detail = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Lấy thông tin đơn hàng thành công',
    data: await service.detail(req.params.id, req.user),
  }),
);
exports.create = asyncHandler(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo đơn hàng thành công',
    data: await service.create(req.body, req.user),
  }),
);
exports.update = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Cập nhật đơn hàng thành công',
    data: await service.update(req.params.id, req.body, req.user),
  }),
);
exports.changeStatus = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Cập nhật trạng thái đơn hàng thành công',
    data: await service.changeStatus(req.params.id, req.body.status, req.user),
  }),
);
exports.pay = asyncHandler(async (req, res) =>
  success(res, {
    message: 'Thanh toán thành công',
    data: await service.pay(req.params.id, req.body, req.user),
  }),
);
