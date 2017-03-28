const express = require('express');
const mongooge = require ('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = express.Router();

const {DATABASE_URL, PORT} = require('./config');
const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

let server;

mongoose.Promise = global.Promise;

//This function starts our server and returns a promise.
function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err)
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                // so we don't also call `resolve()`
                return;
            }
            resolve();
        });
    });
}

    //Log the HTTP layer.
    app.use(morgan('common'));

    //Create blog posts to return some data to view.
    BlogPosts.create('The Happy Man', 'He was a very happy man', 'By the Sad Man', '12-11-92');
    BlogPosts.create('The Sad Man', 'He was a very sad man', 'By the Happy Man', '05-11-99');

    //When the root of this router is called with GET.. return posts.
    
    app.get('/blog-posts', jsonParser, (req, res) => {
        BlogPost
        .find()
        .exec
        .then(posts => {
            res.json(posts.map(post => post.apiRepr()));
        })
        .catch(err => {
         console.log(err);
        //If the document isn't found return a 500 error.
         res.status(500).json({error: ' request could not be fulfilled at this time.'}) // http://www.checkupdown.com/status/E500.html
        });
    });

    app.post('/blog-posts', jsonParser, (req, res) => {
        //Ensure criteria meets blog posts.
        const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(field in req.body)) {
                const message = `Missing \`${field}\` in request body`
                console.error(message);
                return res.status(400).send(message);
            }
        }

        BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(BlogPost => res.status(201).json(blogPost.apiRepr()))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: 'This could not be fulfilled at this time.'});
        });

    });

    //Find an id and remove it.
    app.delete('/blog-posts/:id', jsonParser, (req, res) => {
        BlogPost
        .findByIdAndRemove(req.params.id) //http://mongoosejs.com/docs/api.html
        .exec()
        .then(() => {
            res.status(204).json({message: 'request completed.'});
        });
    });


    //When put request comes in, ensure fields are meeting min.
    //If there are issues with min. fields, throw a 400 error.
    app.put('/blog-posts/:id', jsonParser, (req, res) => {
        const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
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
            author: req.body.author,
            publishDate: req.body.publishDate
        });
        console.log(updatedItem);
        res.status(200).json(updatedItem);
    });

    if (require.main === module) {
      runServer().catch(err => console.error(err));
    };    

    module.exports = {app, runServer, closeServer}; 
