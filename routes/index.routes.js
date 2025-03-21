const router = require('express').Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes)

router.use("*", (req, res) => {
    res.status(400).send({
        "error": true,
        "msg": "Route not found"
    })
});

module.exports = router;