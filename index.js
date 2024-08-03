const express = require('express');
const app = express();
require('dotenv').config(); 
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
var cloudinary = require('cloudinary').v2;

if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
    console.warn('!! cloudinary config is undefined !!');
    console.warn('export CLOUDINARY_URL or set dotenv file');
} else {
    console.log('cloudinary config:');
    console.log(cloudinary.config());
}


// Wire request 'pre' actions
wirePreRequest(app);
// Wire request controllers
// var photosController = require('./src/controller/postController');

// photosController.wire(app);

// Wire request 'post' actions
wirePostRequest(app);

function wirePreRequest(application) {
    application.use(function (req, res, next) {
        console.log(req.method + " " + req.url);
        res.locals.req = req;
        res.locals.res = res;

        if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
            throw new Error('Missing CLOUDINARY_URL environment variable');
        } else {
            // Expose cloudinary package to view
            res.locals.cloudinary = cloudinary;
            next();
        }
    });
}

function wirePostRequest(application) {
    application.use(function (err, req, res, next) {
        if (err.message && (err.message.indexOf('not found') !== -1 || err.message.indexOf('Cast to ObjectId failed') !== -1)) {
            return next();
        }
        console.log('error (500) ' + err.message);
        console.log(err.stack);
        if (err.message.indexOf('CLOUDINARY_URL') !== -1) {
            res.status(500).render('errors/dotenv', { error: err });
        } else {
            res.status(500).render('errors/500', { error: err });
        }
        return undefined;
    });
}

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});


const connect = require('./src/config/db');
connect();

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.set('io', io);

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/blog', require('./src/routes/postRoute'));
app.use('/api/v1/auth', require('./src/routes/userRoute'));
app.use('/api/message', require('./src/routes/messageRoute'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, (err) =>
    err ? console.log(err) : console.log(`Server is running on http://localhost:${PORT}`)
);
