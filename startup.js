require('dotenv').config();
const express = require('express')
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { connectToDB, initDb } = require('./config/database')

const routes = require('./routes/index.routes');
const globalErrorHandler = require('./middleware/error.middleware');

app.use(express.json());
app.use(helmet()) // Security 
app.use(morgan("dev")) // Logging 

// Routes
app.use('/api', routes)

app.use(errors());
app.use(globalErrorHandler)

async function startServer() {
    try {
        const dbConnected = await connectToDB();

        if(!dbConnected){
            console.error("Failed to connect to database, exiting...");
            process.exit(1);
        }

        await initDb(); 

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Listening at port ${PORT}...`);
        })
    } catch(err) {
        console.error("Startup error: ", err);
        process.exit(1);
    }
}

startServer();