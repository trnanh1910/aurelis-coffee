const r = require('express').Router();
const c = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
r.get('/', c.list);
r.get('/:id', c.detail);
r.post('/', protect, authorize('ADMIN'), c.create);
r.put('/:id', protect, authorize('ADMIN'), c.update);
r.delete('/:id', protect, authorize('ADMIN'), c.remove);
module.exports = r;
