const router = require('express').Router();
const controller = require('../controllers/branch.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const uploadBranchImage = require('../middlewares/branchImageUpload.middleware');

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', protect, authorize('ADMIN'), uploadBranchImage, controller.create);
router.put('/:id', protect, authorize('ADMIN'), uploadBranchImage, controller.update);
router.delete('/:id', protect, authorize('ADMIN'), controller.remove);
module.exports = router;
