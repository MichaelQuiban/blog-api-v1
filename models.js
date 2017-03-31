const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema( {
    "title": {type: String, required: true},
    "content":{type: String, required: true},
    "created":{type: Date, default: Date.now},
    "author": {
        firstName: String,
        lastName: String,
    },
});

//Create a full-name of the author.
blogPostSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

//Create key info of the blog post which is Title and date Created.
blogPostSchema.virtual('blogInfo').get(function() {
    return `${this.title} ${this.created}`.trim();
});


blogPostSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.blogInfo,
        content: this.content,
        author: this.authorName
    }
};


const blogPosts = mongoose.model("BlogPosts",blogPostSchema)
module.exports = {blogPosts};





