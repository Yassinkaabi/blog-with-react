
const express = require('express')
const { registerUser, loginUser, logOut } = require('../controller/userController');
const router = express.Router();

router
    .post('/register', registerUser)
    .post('/login', loginUser)
    .post('/logout', logOut)

module.exports = router
