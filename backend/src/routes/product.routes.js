const r = require('express').Router(),
  c = require('../controllers/product.controller'),
  upload = require('../middlewares/upload.middleware'),
  validate = require('../middlewares/validate.middleware'),
  { productRules } = require('../validators/product.validator'),
  { protect, authorize } = require('../middlewares/auth.middleware');
r.get('/', c.list);
r.get('/:id', c.detail);
r.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  upload.single('imageFile'),
  productRules,
  validate,
  c.create,
);
r.put('/:id', protect, authorize('ADMIN', 'MANAGER'), upload.single('imageFile'), c.update);
r.delete('/:id', protect, authorize('ADMIN'), c.remove);
module.exports = r;
