const r = require('express').Router(),
  c = require('../controllers/auth.controller'),
  { protect } = require('../middlewares/auth.middleware'),
  v = require('../middlewares/validate.middleware'),
  rules = require('../validators/auth.validator');
r.post('/register', rules.registerRules, v, c.register);
r.post('/login', rules.loginRules, v, c.login);
r.post('/logout', c.logout);
r.get('/me', protect, c.me);
r.put('/profile', protect, rules.profileRules, v, c.updateProfile);
r.put('/change-password', protect, rules.changePasswordRules, v, c.changePassword);
module.exports = r;
