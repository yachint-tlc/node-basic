const db = require('../config/database');

exports.getProfile = async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, email, full_name FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                error: true,
                msg: "User not found"
            });
        }

        res.json(result.rows[0])

    } catch(err) {
        res.status(500);
        next(err);
    }
}