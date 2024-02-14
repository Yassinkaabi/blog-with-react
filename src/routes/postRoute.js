const express = require('express')
const { register, findAll, remove, findOne, update } = require('../controller/postController');
const router = express.Router();

router
.post('/posts', register)
.get('/posts', findAll)
.get('/posts/:id', findOne)
.put('/posts/:id', update)
.delete('/posts/:id', remove )

module.exports = router
