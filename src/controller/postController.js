const Post = require('../model/post.model');


const register = async (req, res) => {
    const { title, content, author, slug, tags, published } = req.body;
    if (!title || !content || !author || !slug) {
        res.status(400).send({ messsage: "content can not be empty" })
    }
    try {
        const newProduct = await Post.create({
            title: title,
            content: content,
            author: author,
            slug: slug,
            tags: tags,
            published: published,
        })
        res.json(newProduct)
        // res.status(201).json({ msg: 'Product created' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: `something went wrong` })
    }
}

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
        const post = await Post.findByIdAndUpdate(id, { title, content, author, slug, tags, published }, {new : true});
        // res.status(200).json(post);
        res.status(200).send({ message: `Post was successfully updated`});
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



module.exports = { register, findAll, remove, findOne, update }
