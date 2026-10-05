const router = require('express').Router();
const controller = require('../controllers/settings.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/brandLogoUpload.middleware');
const heroUpload = require('../middlewares/heroImageUpload.middleware');

router.get('/logo', controller.getBrandLogo);
router.post('/logo', protect, authorize('ADMIN', 'MANAGER'), upload, controller.uploadBrandLogo);
router.delete('/logo', protect, authorize('ADMIN', 'MANAGER'), controller.removeBrandLogo);
router.get('/hero', controller.getHeroImage);
router.post(
  '/hero',
  protect,
  authorize('ADMIN', 'MANAGER'),
  heroUpload,
  controller.uploadHeroImage,
);
router.delete('/hero', protect, authorize('ADMIN', 'MANAGER'), controller.removeHeroImage);
router.get('/images/:slot', controller.getManagedImage);
router.post(
  '/images/:slot',
  protect,
  authorize('ADMIN', 'MANAGER'),
  heroUpload,
  controller.uploadManagedImage,
);
router.delete(
  '/images/:slot',
  protect,
  authorize('ADMIN', 'MANAGER'),
  controller.removeManagedImage,
);

module.exports = router;
