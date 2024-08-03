const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: String,
    userId: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
    username: String,
    seen: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
