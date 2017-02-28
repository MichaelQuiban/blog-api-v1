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

app.post('/blog-posts', jsonParser, (req, res) => {
	 // ensure criteria meets blog posts.
  const requiredFields = ['id', 'title','content','author','publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const item = BlogPosts.create(req.body.id, req.body.title, req.body.content, req.body.author, req.body.publishDate);
  res.status(201).json(item);
});