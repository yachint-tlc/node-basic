const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;