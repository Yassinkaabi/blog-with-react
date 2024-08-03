
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.checkVerified = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) {
        return res.status(403).json({
            status: 'error',
            message: 'Please verify your email to access this resource'
        });
    }
    next();
};
