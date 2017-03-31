const express = require('express');
const mongoose = require ('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');


//Mongoose internally uses a 'promise-like' object.
mongoose.Promise = global.Promise;

//Config.js is where we conrol constants for entire app.
const {DATABASE_URL, PORT} = require('./config');
const {BlogPosts} = require('./models');

//Creates an express appliction.
const app = express();

app.use(morgan('common')); //https://www.npmjs.com/package/morgan || Standard Apache common log output.
app.use(bodyParser.json()); //https://github.com/expressjs/body-parser || Body parsing middleware.

let server;




    //When the root of this router is called with GET.. return posts.
    app.get('/blogPosts', bodyParser, (req, res) => {
        BlogPosts
        .find() //https://docs.mongodb.com/manual/reference/method/db.collection.find/
        .exec 
        .then(posts => {
            res.json(blogPosts.map(post => post.apiRepr()));
        })
        .catch(err => {
         console.log(err);
        //If the document isn't found return a 500 error.
         res.status(500).json({error: ' request could not be fulfilled at this time.'}) // http://www.checkupdown.com/status/E500.html
        });
    });

    //When the root of this router is called with GET.. return posts.
    app.get('/posts/:id', (req, res) =>{
        BlogPosts
        .findById(req.params.id) //http://mongoosejs.com/docs/api.html
        .exec()
        .then(post => res.json(post.apiRepr()))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: ' requested ID could not be gathered at this time.'});
        });
    });

    app.post('/blogPosts', bodyParser, (req, res) => {
        //Ensure criteria meets blog posts.
        const requiredFields = ['title', 'content', 'author', 'publishDate'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(field in req.body)) {
                const message = `Missing \`${field}\` in request body`
                console.error(message);
                return res.status(400).send(message);
            }
        }

        BlogPosts
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate
        })
        .then(BlogPost => res.status(201).json(blogPost.apiRepr()))
        .catch(err => {
            console.log(err);
            res.status(500).json({error: 'This could not be fulfilled at this time.'});
        });

    });

    //Find an id and remove it.
    app.delete('/blog-posts/:id', bodyParser, (req, res) => {
        BlogPosts
        .findByIdAndRemove(req.params.id) //http://mongoosejs.com/docs/api.html
        .exec()
        .then(() => {
            res.status(204).json({message: 'request completed.'});
        });
    });


    //When put request comes in, ensure fields are meeting min.
    //If there are issues with min. fields, throw a 400 error.
    app.put('/blog-posts/:id', bodyParser, (req, res) => {
        const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
                const message = `Path ID and request body id values must match`
                console.error(message);
                return res.status(400).send(message);
            }
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
