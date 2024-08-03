const Message = require("../model/message.model");
const User = require("../model/user.model");

// Retrieve notifications for all
exports.getMessages = async (req, res) => {
    const { id } = req.params;
    try {
        const messages = await Message.find({ id });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAllMessagesForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).populate('sender receiver', 'username email')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).send('User not found');
        }

        // Vérifier si les utilisateurs sont amis
        if (sender.friends.includes(receiverId)) {
            const newMessage = new Message({
                content,
                sender: senderId,
                receiver: receiverId
            });

            await newMessage.save();

            // Emit notification event
            const io = req.app.get('io');
            io.emit('message', newMessage); // Emit the message to all connected clients
            res.status(200).send('Message sent successfully');
        } else {
            res.status(403).send('Users are not friends');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getUserByMessage = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('friends', 'username email');

        if (!user) {
            return res.status(404).send('User not found');
        }

        const friendsMessages = await Message.find({
            $or: [
                { sender: userId, receiver: { $in: user.friends } },
                { receiver: userId, sender: { $in: user.friends } }
            ]
        }).populate('sender receiver', 'username email');

        const friendsList = user.friends.map(friend => ({
            id: friend._id,
            username: friend.username,
            // email: friend.email,
        }));

        const messagesWithFriends = friendsMessages.map(message => ({
            content: message.content,
            sender: {
                id: message.sender._id,
                username: message.sender.username,
                // email: message.sender.email,
            },
            receiver: {
                id: message.receiver._id,
                username: message.receiver.username,
                // email: message.receiver.email,
            },
            createdAt: message.createdAt

        }));

        res.status(200).json({
            friends: friendsList,
            messages: messagesWithFriends
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getMessagesBetweenUser = async (req, res) => {
    const { userId1, userId2 } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
};