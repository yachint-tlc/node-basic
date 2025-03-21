const { Pool } = require('pg');
const DATABASE_URI = process.env.DATABASE_URI;
const DB_MAX_CONNECTIONS = process.env.DB_MAX_CONNECTIONS || "20";
const DB_IDLE_TIMEOUT_MS = process.env.DB_IDLE_TIMEOUT_MS || "30000"

const poolConfig = {
    connectionString: DATABASE_URI,
    max: DB_MAX_CONNECTIONS,
    idleTimeoutMillis: DB_IDLE_TIMEOUT_MS,
    ssl: {
        rejectUnauthorized: false
    },
}

const pool = new Pool(poolConfig)

pool.on("error", (err, client) => {
    console.error("Unexpected error on idle Postgres client", err);
});

pool.on("connect", () => {
    console.log("Successfully connected to PostgreSQL database")
});

const connectToDB = async () => {
    let client;
    try {
        client = await pool.connect();
        return true;
    } catch(err) {
        console.error("Failed to connect to PostgresSQL: ", err)
        return false;
    } finally {
        if(client) client.release();
    }
}

const initDb = async() => {
    try {
        console.log("Database tables initialized successfully")
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

    } catch(err) {
        console.error(`Error while creating init tables: ${err.message}`);
        throw err;
    }
}

const query = async(text, params) => {
    const start = Date.now();
    try {
        const response = await pool.query(text, params);
        const duration = Date.now() - start;

        if(duration > 1000){
            console.log(`Slow query: QUERY: ${text}, DURATION: ${duration}, ROWS: ${response.rowCount}`)
        }

        return response;
    } catch(err) {
        console.error(`Query Error: ${err.message}`)
        throw err;
    }
}

const transaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch(err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    connectToDB,
    query,
    transaction,
    initDb
}
