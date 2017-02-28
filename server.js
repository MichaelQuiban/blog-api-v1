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

// when DELETE request comes in with an id in path,
// try to delete that item from Blog posts.
app.delete('/blog-posts', jsonParser, (req,res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted Blog post with an id of \`${req.params.id}\``);
	res.status(204).end();
});

//When the root of this router is called with GET..
// Return Blog posts.
app.get('/blog-posts', jsonParser, (req, res) => {
	res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req, res) => {
//Ensure criteria meets blog posts.
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

//When put request comes in, ensure fields are meeting min.
//If there are issues with min. fields, throw a 400 error.
app.put('blog-posts:id', jsonParser, (req, res) => {
  const requiredFields = ['id', 'title', 'content','author','publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating Blog posts \`${req.params.id}\``);
  const updatedItem = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.author.content,
    publishDate: req.publishDate.content
  });
  res.status(204).json(updatedItem);
});

app.listen(process.env.PORT || 8080, () => {
	console.log(`This app is listening on Michael's Blog Port ${process.env.PORT || 8080}`);
})