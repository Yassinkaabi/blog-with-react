const express = require('express')
const { registerUser, loginUser, logOut, getUserByID, sendInvitation, declineInvitation, acceptInvitation, unfollow, follow, getAllUsers, getReceivedInvitations, sendMail, verifyEmail } = require('../controller/userController');
const router = express.Router();

router
    .post('/register', registerUser)
    .post('/login', loginUser)
    .post('/logout', logOut)
    .get('/verify/:token', verifyEmail)

    // get all user
    .get('/users', getAllUsers)
    // get user by id
    .get('/:id', getUserByID)
    //send invitation
    .post('/send-invitation', sendInvitation)
    //reccieve invitation
    .get('/received-invitations/:userId', getReceivedInvitations)
    //accepte invitation
    .post('/accept-invitation', acceptInvitation)
    //decline invitation
    .post('/decline-invitation', declineInvitation)
    //follow
    .post('/follow', follow)
    //unfollow
    .post('/unfollow', unfollow)
    //send email
    .post("/email", sendMail)
module.exports = router
