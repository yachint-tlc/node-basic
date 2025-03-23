const { app, startServer } = require('../startup');
const db = require('../config/database');

class TestEngine {
    static server = app;
    static isServerStarted = false;

    static cleanupDatabase = async (email) => {
        try {
            await db.query(
                'DELETE FROM users WHERE email = $1',
                [email]
            );
        } catch(err) {
            console.error('Database cleanup failed:', err);
            throw err;
        }
    }

    static startServer = async () => {
        if(!TestEngine.isServerStarted){
            try {
                await startServer();
                TestEngine.isServerStarted = true;
            } catch(err) {
                console.error('Error occured in starting server: ', err);
                throw err;
            }
        }
        return TestEngine.server;
    }
}

module.exports = TestEngine;