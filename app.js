require('dotenv').config()
const rateLimit = require("express-rate-limit");
const route = require('./src/routes/index');
const express = require('express');
const port = process.env.PORT;
var cors = require('cors');
require('./src/db/db');

const app = express();
app.use(cors());
var http = require('http').createServer(app);
app.use(express.json());

app.use((error, request, response, next) => {
    if (error !== null) {
        return response.status(400).json({ success: false, message: 'Invalid json' });
    }
    return next();
});

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(route);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})