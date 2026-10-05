const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
router.use(protect);
router.get('/', authorize('ADMIN', 'MANAGER', 'CASHIER', 'BARISTA', 'CUSTOMER'), controller.list);
router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'BARISTA', 'CUSTOMER'),
  controller.detail,
);
router.post('/', authorize('ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'), controller.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'CASHIER'), controller.update);
router.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'CASHIER', 'BARISTA'),
  controller.changeStatus,
);
router.post('/:id/payment', authorize('ADMIN', 'MANAGER', 'CASHIER'), controller.pay);
module.exports = router;
