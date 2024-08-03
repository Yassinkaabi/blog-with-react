const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isValidEmail } = require('../Middleware/UserValidation');
const { sendEmail } = require('../utils/nodeMailer');
const crypto = require("crypto");

require('dotenv').config();

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, repeatPassword } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: 'You have already registered' });
        if (!isValidEmail(email)) {
            return res.status(400).json({ msg: 'Invalid email address format.' });
        }
        if (password.length < 8 || !/[A-Z]/.test(password)) {
            return res.status(400).json({
                msg: 'Password at least 8 characters long, and contain at least one capital letter.'
            });
        }
        if (password !== repeatPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Passwords do not match.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const emailToken = crypto.randomBytes(32).toString('hex');
        const verificationToken = jwt.sign({ emailToken }, process.env.JWT_SECRET, { expiresIn: '1d' });

        let user = await User.create({
            username,
            email,
            password: hashedPassword,
            emailToken: verificationToken,
            isVerified: false
        });

        // Send confirmation email
        const url = `${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}`;
        await sendEmail(email, 'Confirm Email', `Click this link to confirm your email: ${url}`);

        return res.status(201).json({
            status: 'success',
            data: {
                user: user,
                verificationLink: url,
            },
            message: 'Please check your email to confirm your registration.'
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// @desc    Verify user email
// @route   GET /api/v1/auth/verify/:token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ emailToken: token });
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid token'
            });
        }

        user.isVerified = true;
        user.emailToken = undefined;
        await user.save();

        // Generate JWT token for user session
        // const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Example: Expires in 1 hour

        // Redirect user to frontend with JWT token
        res.redirect(`${process.env.FRONTEND_URL}/verification-success`);
        // return res.status(200).json({
        //     status: 'success',
        //     message: 'Email verified successfully!'
        // });
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};


// @desc    Login an existing user
// @route   POST /api/v1/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // check if the user exists in the database
    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
        return res.status(400).json({
            status: 'error',
            message: 'Email not exist!'
        });
    }

    // compare passwords - bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            status: 'error',
            message: 'Email or Password not matched!'
        });
    }

    // create a token and send it to the client
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
        status: "success",
        result: {
            token: token,
            isVerified: user.isVerified,
            userId: user._id
        },
        message: "Logged In Successfully"
    });

};

// Retrieve all users
exports.getAllUsers = async (req, res) => {
    try {
        const user = await User.find();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to retrieve user');
    }
};

// Retrieve user
exports.getUserByID = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to retrieve user');
    }
};

// Get received invitations for a user
exports.getReceivedInvitations = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('receivedInvitations');

        if (!user) {
            return res.status(404).send('User not found');
        }

        const receivedInvitations = user.receivedInvitations.map(invitation => ({
            _id: invitation._id,
            senderId: invitation._id,
            senderName: invitation.username // Assuming invitation has sender populated
        }));

        res.json(receivedInvitations);
    } catch (error) {
        console.error('Error fetching received invitations:', error);
        res.status(500).send('Server error');
    }
};

// Send an invitation
exports.sendInvitation = async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).send('User not found');
        }

        // Add the receiver to the sender's sent invitations list
        sender.sentInvitations.push(receiverId);
        // Add the sender to the receiver's received invitations list
        receiver.receivedInvitations.push(senderId);

        await sender.save();
        await receiver.save();

        // Emit event to the receiver
        const io = req.app.get('io');
        io.to(receiverId).emit('invitationReceived', {
            senderId,
            senderName: sender.username
        });

        res.status(200).send('Invitation sent successfully');
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// Accepter une invitation
exports.acceptInvitation = async (req, res) => {
    const { userId, senderId } = req.body;
    try {
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!user || !sender) {
            return res.status(404).send('User not found');
        }

        // Retirer l'invitation reçue
        user.receivedInvitations.pull(senderId);
        // Ajouter à la liste d'amis
        user.friends.push(senderId);

        // Retirer l'invitation envoyée
        sender.sentInvitations.pull(userId);
        // Ajouter à la liste d'amis
        sender.friends.push(userId);

        await user.save();
        await sender.save();

        // Emit event to the sender
        const io = req.app.get('io');
        io.to(senderId).emit('invitationAccepted', { userId, userName: user.username });

        res.status(200).send('Invitation accepted successfully');
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Décliner une invitation 
exports.declineInvitation = async (req, res) => {
    const { userId, senderId } = req.body;
    try {
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return res.status(404).send('User not found');
        }

        if (!sender) {
            console.error(`Sender with ID ${senderId} not found`);
            return res.status(404).send('Sender not found');
        }

        // Vérifier si l'invitation existe dans les invitations reçues
        if (!user.receivedInvitations.includes(senderId)) {
            console.error(`Invitation from sender ID ${senderId} not found in user ${userId} received invitations`);
            return res.status(400).send('Invitation not found in received invitations');
        }

        // Retirer l'invitation reçue
        user.receivedInvitations.pull(senderId);

        // Retirer l'invitation envoyée
        if (sender.sentInvitations.includes(userId)) {
            sender.sentInvitations.pull(userId);
        } else {
            console.error(`Invitation to user ID ${userId} not found in sender's sent invitations`);
            return res.status(400).send('Invitation not found in sent invitations');
        }

        await user.save();
        await sender.save();

        res.status(200).send('Invitation declined successfully');
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send('Server error');
    }
};

// Suivre un utilisateur
exports.follow = async (req, res) => {
    const { userId, followId } = req.body;
    try {
        const user = await User.findById(userId);
        const followUser = await User.findById(followId);

        if (!user || !followUser) {
            return res.status(404).send('User not found');
        }

        if (!user.following.includes(followId)) {
            user.following.push(followId);
            followUser.followers.push(userId);

            await user.save();
            await followUser.save();

            res.status(200).send('Followed successfully');
        } else {
            res.status(400).send('Already following');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Se désabonner d'un utilisateur
exports.unfollow = async (req, res) => {
    const { userId, unfollowId } = req.body;
    try {
        const user = await User.findById(userId);
        const unfollowUser = await User.findById(unfollowId);

        if (!user || !unfollowUser) {
            return res.status(404).send('User not found');
        }

        if (user.following.includes(unfollowId)) {
            user.following.pull(unfollowId);
            unfollowUser.followers.pull(userId);

            await user.save();
            await unfollowUser.save();

            res.status(200).send('Unfollowed successfully');
        } else {
            res.status(400).send('Not following');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// @desc    Logout current logged in user
// @route   GET /api/v1/auth/logout
exports.logOut = (req, res) => {
    res.clearCookie('token').json({
        status: 'success',
        message: 'User has been logged out successfully.'
    });
};


exports.sendMail = async (req, res) => {
    await nodeMailer("yassinkaabi14@gmail.com", "test email", "Hello yassine", "<p> test test test </p>")
    res.status(200).send('Email sent successfully')

    // res.status(500).send('Email not sent');
}