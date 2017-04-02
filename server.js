const express = require('express');
const mongoose = require ('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

//Config.js is where we conrol constants for entire app.
const {DATABASE_URL, PORT} = require('./config');
const {BlogPosts} = require('./models');

//Creates an express appliction.
const app = express();

app.use(morgan('common')); //https://www.npmjs.com/package/morgan || Standard Apache common log output.
app.use(bodyParser.json());//https://github.com/expressjs/body-parser || Body parsing middleware.

//Mongoose internally uses a 'promise-like' object.
mongoose.Promise = global.Promise;

     //When the root of this router is called with GET.. return posts.
    app.get('/blog-posts', bodyParser, (req, res) => {
        BlogPosts
            .find() //https://docs.mongodb.com/manual/reference/method/db.collection.find/
            .exec
            .then(posts => {
                res.json(post.map(post => post.apiRepr()));
            })
            .catch(err => {
                console.error(err);
                //If the document isn't found return a 500 error.
                res.status(500).json({
                    error: ' request could not be fulfilled at this time.'
                }) // http://www.checkupdown.com/status/E500.html
            });
    });

    //When the root of this router is called with GET.. return posts.
    app.get('/blog-posts/:id', (req, res) => {
        BlogPosts
            .findById(req.params.id) //http://mongoosejs.com/docs/api.html
            .exec()
            .then(post => res.json(post.apiRepr()))
            .catch(err => {
                console.error(err);
                res.status(500).json({
                    error: ' requested ID could not be gathered at this time.'
                });
            });
    });

    app.post('/blog-posts', bodyParser, (req, res) => {
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
            .then(blogPost => res.status(201).json(blogPost.apiRepr()))
            .catch(err => {
                console.error(err);
                res.status(500).json({
                    error: 'This could not be fulfilled at this time.'
                });
            });

    });

    //Find an id and remove it.
    app.delete('/blog-posts/:id', bodyParser, (req, res) => {
        BlogPosts
            .findByIdAndRemove(req.params.id) //http://mongoosejs.com/docs/api.html
            .exec()
            .then(() => {
                res.status(204).json({
                    message: 'request completed.'
                });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({
                    error: 'Post removal request could not be fulfilled at this time'
                });
            });
    });


    //When put request comes in, ensure fields are meeting min.
    //If there are issues with min. fields, throw a 400 error.
  
    app.put('/blog-posts/:id', (req, res) => {
        if (!(req.params.id && req.body.id === req.body.id)) {
            res.status(400).json({
                error: 'Request path id and request body id values must match'
            });
        }
        const updated = {};
        const updateableFields = ['title', 'content', 'author'];
        updateableFields.forEach(field => {
            if (field in req.body) {
                updated[field] = req.body[field];
            }
        });
        BlogPosts
            .findByIdAndUpdate(req.params.id, {
                $set: updated
            }, {
                new: true
            })
            .exec()
            .then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
            .catch(err => res.status(500).json({
                message: 'Something went wrong'
            }));
    });

    
    app.delete('/:id', (req, res) => {
      BlogPosts
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(() => {
          console.log(`Deleted blog post with id \`${req.params.ID}\``);
          res.status(204).end();
        });
    });

    app.use('*', function(req, res) {
     res.status(404).json({message: 'Not Found'});
    });

    // this function connects to our database, then starts the server.
    function runServer(databaseUrl = DATABASE_URL, port = PORT) {
        return new Promise((resolve, reject) => {
            mongoose.connect(databaseUrl, err => {
                if (err) {
                    return reject(err);
                }
                server = app.listen(port, () => {
                        console.log(`Your app is listening on port ${port}`);
                        resolve();
                    })
                    .on('error', err => {
                        mongoose.disconnect();
                        reject(err);
                    });
            });
        });
    }

    // this function closes the server, and returns a promise. we'll
    function closeServer() {
        return mongoose.disconnect().then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }


    if (require.main === module) {
        runServer().catch(err => console.error(err));
    };

    module.exports = {
        app,
        runServer,
        closeServer
    };