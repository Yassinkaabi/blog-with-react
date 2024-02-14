const express = require('express')
const app = express()
const cors = require('cors');

require('dotenv').config()

const connect = require('./src/config/db');
connect();
app.use(cors());
app.use(cors('https://localhost:3000'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/blog', require('./src/routes/postRoute'))

app.listen(process.env.PORT, (err) =>
    err ?
        console.log(err)
        : console.log(`server is running on localhost ${process.env.PORT}`)
)
