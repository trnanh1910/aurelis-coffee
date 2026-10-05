const r = require('express').Router(),
  c = require('../controllers/dashboard.controller'),
  { protect, authorize } = require('../middlewares/auth.middleware');
r.use(protect, authorize('ADMIN', 'MANAGER'));
r.get('/overview', c.overview);
r.get('/revenue', c.revenue);
module.exports = r;
