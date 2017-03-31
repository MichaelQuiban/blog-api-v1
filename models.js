const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema( {
    "title": {type: String, required: true},
    "content":{type: String, required: true},
    "author": {
        firstName: String,
        lastName: String,
    },
});

const blogPosts = mongoose.model("BlogPosts",blogPostSchema)
module.exports = {blogPosts};





