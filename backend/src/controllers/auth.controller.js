const svc = require('../services/auth.service');
const { success } = require('../utils/apiResponse');
const ah = require('../middlewares/asyncHandler');
exports.login = ah(async (req, res) =>
  success(res, {
    message: 'Đăng nhập thành công',
    data: await svc.login(req.body.email, req.body.password),
  }),
);
exports.register = ah(async (req, res) =>
  success(res, {
    status: 201,
    message: 'Tạo tài khoản thành công',
    data: await svc.registerCustomer(req.body),
  }),
);
exports.me = ah(async (req, res) =>
  success(res, { message: 'Lấy thông tin người dùng thành công', data: req.user }),
);
exports.updateProfile = ah(async (req, res) =>
  success(res, {
    message: 'Cập nhật thông tin thành công',
    data: await svc.updateCustomerProfile(req.user.id, req.body),
  }),
);
exports.changePassword = ah(async (req, res) => {
  await svc.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  success(res, { message: 'Đổi mật khẩu thành công' });
});
exports.logout = ah(async (_req, res) => success(res, { message: 'Đăng xuất thành công' }));
