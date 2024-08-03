const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    notifications: [{ type: String }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentInvitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    receivedInvitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    emailToken: { type: String },
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
