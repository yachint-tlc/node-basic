const { connectToDB } = require('../config/database');

exports.health = async (req, res, next) => {
    try {
        let isDBConnectionHealthy = connectToDB();
        if (!isDBConnectionHealthy) {
            return res.status(500).send({
                "error": true,
                "msg": "Server NOT Healthy!"
            })
        }

        res.status(200).send({
            "error": false,
            "msg": "Server Healthy!"
        });

    } catch(err) {
        res.status(500);
        next(err);
    }
}