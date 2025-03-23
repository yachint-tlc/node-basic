const router = require('express').Router()
const healthController = require('../controllers/health.controller')

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check server health
 *     tags: [Health]
 *     description: Checks the health of the server and its database connection.
 *     responses:
 *       200:
 *         description: Server is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Server Healthy!"
 *       500:
 *         description: Server is not healthy or database connection failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Server NOT Healthy!"
 */
router.get('/', healthController.health)

module.exports = router;

