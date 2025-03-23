const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validator = require('../middleware/validation.middleware');
const authValidator = require('../validators/auth.validator');

router.post('/register', validator(authValidator.register), authController.register);
router.post('/login', validator(authValidator.login), authController.login);
router.post('/refresh-token', validator(authValidator.refreshToken), authController.refreshToken);
router.post('/logout', validator(authValidator.logout), authController.logout);
router.post('/logout-all', validator(authValidator.logout), authMiddleware, authController.logoutAll);

module.exports = router;