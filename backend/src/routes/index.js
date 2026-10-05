const router = require('express').Router();
router.get('/health', (_req, res) =>
  res.json({
    success: true,
    message: 'API Aurelis Coffee đang hoạt động bình thường',
    data: { timestamp: new Date().toISOString() },
  }),
);
router.use('/auth', require('./auth.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/branches', require('./branch.routes'));
router.use('/tables', require('./table.routes'));
router.use('/orders', require('./order.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/admin', require('./admin.routes'));
module.exports = router;
