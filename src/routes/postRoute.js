const express = require('express')
const { register, findAll, remove, findOne, update, getNotifications, deleteNotification, seenNotification, getUserOfNotification } = require('../controller/postController');
const router = express.Router();

router
.post('/create', register)
.get('/posts', findAll)
.get('/posts/:id', findOne)
.put('/posts/:id', update)
.delete('/posts/:id', remove )
// Route for retrieving notifications
.get('/notifications', getNotifications)
.get('/notifications/:id',getUserOfNotification)
.delete('/notifications/:id', deleteNotification)
.put('/notifications/seen/:id',seenNotification)
module.exports = router
