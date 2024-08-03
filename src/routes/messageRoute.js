const express = require('express');
const { getMessages, getUserByMessage, getMessagesBetweenUser, getAllMessagesForUser, sendMessage } = require('../controller/messageController');
const router = express.Router();

router
    .post('/send-message', sendMessage)
    .post('/messages/:userId', getAllMessagesForUser)
    .get('/user-by-message/:userId', getUserByMessage)
    .get('/messages/:userId1/:userId2', getMessagesBetweenUser)
module.exports = router
