const Post = require('../model/post.model');
const Notification = require('../model/notification.model');
const User = require('../model/user.model')
const cloudinary = require("../utils/cloudinary")


const register = async (req, res) => {
    const { title, content, author, slug, tags, published, user, image } = req.body;

    // Log the incoming request body
    console.log('Request body:', req.body);

    if (!title || !content || !author || !slug || !user) {
        return res.status(400).send({ message: "Content or user field cannot be empty" });
    }

    try {
        const result = await cloudinary.uploader.upload(image, {
            folder: "posts",
        })
        const newPost = await Post.create({
            title,
            content,
            author,
            slug,
            tags,
            published,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            },
            user
        });

        // Log the created post
        console.log('New post created:', newPost);

        // Fetch the user details to get the username
        const postUser = await User.findById(user);
        if (!postUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a notification
        const notification = await Notification.create({
            message: `New post created by ${author}`,
            userId: user, // 'user' should be the user ID
            postId: newPost._id,
            username: postUser.username // Include the username of the post creator
        });

        // Log the created notification
        console.log('New notification created:', notification);

        // Emit notification event
        const io = req.app.get('io');
        io.emit('notification', notification);

        return res.status(201).json(newPost);

    } catch (error) {
        console.error('Error in register function:', error);
        return res.status(500).json({ msg: 'Something went wrong' });
    }
};

// Retrieve notifications for all
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to retrieve notifications');
    }
};

// Retrieve notifications for a specific user
const getUserOfNotification = async (req, res) => {
    try {
        const id = req.params.id;
        const notification = await Notification.findById(id);
        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to retrieve notifications');
    }
};

const deleteNotification = async (req, res) => {
    try {
        const id = req.params.id
        await Notification.findByIdAndDelete(id);
        res.status(200).json("notification deleted successfully")
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to delete notifications');
    }
}

// Mark all notifications as seen for a user
const seenNotification = async (req, res) => {
    try {
        const id = req.params.id;
        await Notification.findByIdAndUpdate(id, { seen: true });
        res.status(200).send('Notifications marked as seen');
    } catch (error) {
        console.error('Error marking notifications as seen:', error);
        res.status(500).send('Unable to mark notifications as seen');
    }
};

const findAll = async function (req, res) {
    try {
        const post = await Post.find();
        res.json(post);
    } catch (error) {
        res.status(500).send('no post found')
    }
}

const findOne = async function (req, res) {
    try {
        const id = req.params.id
        const post = await Post.findById(id);
        res.json(post);
    } catch (error) {
        res.status(500).send('no post found')
    }
}

const update = async function (req, res) {
    try {
        const id = req.params.id
        const { title, content, author, slug, tags, published } = req.body;
        const post = await Post.findByIdAndUpdate(id, { title, content, author, slug, tags, published }, { new: true });
        // res.status(200).json(post);
        res.status(200).send({ message: `Post was successfully updated` });
    } catch (error) {
        res.status(400).send("Unable to update the post")
    }
}


const remove = async function (req, res) {
    try {
        const id = req.params.id;
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            res.status(400).send("post not found")
        }
        res.status(200).send('post has been deleted successfully');
    } catch (error) {
        res.status(500).send('no post found')
    }
}



module.exports = { register, findAll, remove, findOne, update, getNotifications, deleteNotification, seenNotification, getUserOfNotification }
