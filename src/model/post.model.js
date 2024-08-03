const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
    },
    published: {
        type: Boolean,
        enum: [true, false],
        default: true
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
    {
        timestamps: true
    });

// PostSchema.method('toJson', function () {
//     const { __v, _id, ...object } = this.toObject();
//     object.id = _id;
//     return object;
// })
module.exports = mongoose.model('Post', PostSchema);
