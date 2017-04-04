const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
//Syntax availability.
const should = chai.should();
//We'll be performing our tests in the Server, which gathers from the models.
const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const {DATABASE_URL} = require('../config');
//Allow the use of syntax available through chai.
chai.use(chaiHttp);
//Delete the entire data and ensure proper, and clean data.
function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Removing database...');
        mongoose.connection.dropDatabase().then(result => resolve(result)).catch(err => reject(err))
    });
}
//Generate seed data using faker, this will create our placeholders.
function seedBlogPostData() {
    console.info('Seeding Blog Post data...');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
        seedData.push({
            author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName()
            },
            title: faker.lorem.sentence(),
            content: faker.lorem.text()
        });
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
}
describe('Blog posts API resources', function() {
            before(function() {
                return runServer();
            });
            beforeEach(function() {
                return seedBlogPostData();
            });
            afterEach(function() {
                return tearDownDb();
            })
            after(function() {
                return closeServer();
            });
            //Assure our GET response passes through each hurdle provided below.
            describe('Get endpoint', function() {
                        it('should return all existing posts.', function() {
                            let res;
                            return chai
                            .request(app)
                            .get('/blog-posts')
                            .then(_res => {
                                res = _res;
                                res.should.have.status(200); //https://httpstatuses.com/200
                                // otherwise our db seeding didn't work
                                res.body.should.have.length.of.at.least(1);
                                return BlogPost.count();
                            }).then(count => {
                                res.body.should.have.length.of(count);
                            });
                        });
                        it('Should return posts with correct fields.', function() {
                            let resPost;
                            return chai.request(app).get('/blog-posts').then(function(res) {
                                res.body.should.be.a('array');
                                res.should.have.status(200); //https://httpstatuses.com/200
                                res.should.be.json;
                                res.body.should.have.length.of.at.least(1);

                                res.body.foreach(function(post) {
                                    post.should.include.keys('id', 'title', 'content', 'author', 'created');
                                    post.should.be.a('object');
                                })
                                .then(post => {

                                    resPost.title.should.equal(post.title);
                                    resPost.content.should.equal(post.content);
                                    resPost.author.should.equal(post.authorName);

                                });
                            });
                        });
                        describe('POST endpoint', function() {
                            it('should add a new blog post', function() {
                                const newPost = {
                                    title: faker.lorem.sentence(),
                                    author: {
                                        firstName: faker.name.firstName(),
                                        lastName: faker.name.lastName(),
                                     },
                                        content: faker.lorem.text()
                                     };
                                    .post('/blog-posts')
                                    .send(newPost)
                                    .then(function(res) {

                                    res.should.have.status(201); //https://httpstatuses.com/201
                                    res.should.be.json;
                                    res.body.should.be.a('object');
                                    res.body.should.include.keys('id', 'title', 'content', 'author', 'created');
                                    res.body.title.should.equal(newPost.title);

                                    // cause Mongo should have created id on insertion
                                    res.body.id.should.not.be.null;
                                    res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                                    res.body.content.should.equal(newPost.content);

                                    return BlogPost.findById(res.body.id).exec();
                                })
                                    .then(function(post) {

                                    post.title.should.equal(newPost.title);
                                    post.content.should.equal(newPost.content);
                                    post.author.firstName.should.equal(newPost.author.firstName);
                                    post.author.lastName.should.equal(newPost.author.lastName);

                                });
                            });
                        });
                        describe('PUT endpoints', function() {
                                //Get an existing post, make a put request, validate the data.
                                it('should update fields you send over', function() {
                                    const updatePost = {
                                        title: "Cat in the hat!",
                                        content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
                                        author: {
                                            firstName: 'J.K',
                                            lastName: 'Rowling',
                                        }
                                    };
                                    return BlogPost
                                    .findOne()
                                    .exec()
                                    .then(post => {
                                        updatePost.id = post.id;

                                        return chai.request(app).put(`/blog-posts/${post.id}`).send(updatePost);
                                    })
                                    .then(res => {

                                        res.should.be.json;
                                        res.body.should.be.a('object');
                                        res.should.have.status(201); //https://httpstatuses.com/201
                                        res.body.title.should.equal(updateData.title);
                                        res.body.content.should.equal(updateData.content);
                                        res.body.author.should.equal(`${updateData.author.firstName} ${updateData.author.lastName}`);

                                        return BlogPost.findById(res.body.id).exec();
                                    })
                                    .then(post => {

                                        post.title.should.equal(updateData.title);
                                        post.author.lastName.should.equal(updateData.author.lastName);
                                        post.content.should.equal(updateData.content);
                                        post.author.firstName.should.equal(updateData.author.firstName);

                                    });
                                });
                            }
                        };
                        describe('DELETE endpoint', function() {
                            it('should delete a post by id', function() {
                                let post;
                                return BlogPost
                                .findOne()
                                .exec()
                                .then(_post => {
                                    post = _post;
                                    return chai.request(app).delete(`/blog-posts/${post.id}`);
                                }).then(res => {
                                    res.should.have.status(204); //https://httpstatuses.com/204
                                    return BlogPost.findById(post.id);
                                }).then(_post => {
                                    should.not.exist(_post);
                                });
                            });
                        });