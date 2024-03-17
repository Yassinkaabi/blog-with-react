const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isValidEmail } = require('../Middleware/UserValidation');
require('dotenv').config();

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, repeatPassword, isAuth } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: 'you have already registred' })
        if (!isValidEmail(email)) {
            return res.status(400).json({ msg: 'Invalid email address format.' });
        }
        if (password.length < 8 || !/[A-Z]/.test(password)) {
            return res.status(400)
                .json({
                    msg: 'Password at least 8 characters long, and contain at least one capital letter.'
                });
        }
        // Check if passwords match
        if (password !== repeatPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Passwords do not match.'
            });
        }
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = await User.create({ username, email, password: hashedPassword });
        return res.status(201).json({
            status: 'success',
            data: {
                user: user,
            }
        });
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
            userId: user._id
        },
        message: "Logged In Successfully"
    });

};

// @desc    Logout current logged in user
// @route   GET /api/v1/auth/logout
exports.logOut = (req, res) => {
    res.clearCookie('token').json({
        status: 'success',
        message: 'User has been logged out successfully.'
    });
};
