const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = express.Router();

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

//Log the HTTP layer
app.use(morgan('common'));

//Create blog posts to return some data to view.
BlogPosts.create('The Happy Man','He was a very happy man', 'By the Sad Man', '12-11-92');
BlogPosts.create('The Sad Man','He was a very sad man', 'By the Happy Man', '05-11-99');

//When the root of this router is called with GET..
// Return Blog posts.
app.get('/blog-posts', jsonParser, (req, res) => {
	res.json(BlogPosts.get());
});
