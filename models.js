const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema( {
    "title": {type: String, required: true},
    "author": {
        firstName: String,
        lastName: String,
    },
    "content":{type: String, required: true}
});

const blogPosts = mongoose.model("BlogPosts",blogPostSchema)
module.exports = {blogPosts};





