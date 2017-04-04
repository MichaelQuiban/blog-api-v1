const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require ('faker');
const mongoose = require('mongoose');

//Syntax availability.
const should = chai.should();

//We'll be performing our tests in the Server, which gathers from the models.
const {app,runServer,closeServer} = require('../server');
const {BlogPost} = require('../models');
const {DATABASE_URL} = require('../config');
const {TEST_DATABASE_URL} = reqire('../config')

//Allow the use of syntax available through chai.
chai.use(chaiHttp);

describe('Blog Posts', function() {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function() {
        return runServer();
    });

    // Close server after these tests run just in case
    after(function() {
        return closeServer();
    });

    //Assure our GET response passes through each hurdle provided below.
    it('should list users on GET', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                res.should.have.status(200); //https://httpstatuses.com/200
                res.should.be.json;
                res.body.forEach(function(item) {
                    item.should.be.a('object');
                    item.should.have.all.keys(
                       'id', 'title', 'content', 'author', 'publishDate');
                });
            });
        done();
    });
    //Assure our POST response mimics the template of our body content.
    it('should list users on POST', function(done) {
        const postExample = {
            title: 'Test Title',
            content: 'The content would be placed here.',
            author: 'Dr. Suess',
            publishDate: 1995
        };

        const expectedKey = ['id'].concat(Object.keys(postExample));
   

    chai.request(app)
        .post('/blog-posts')
        .send(postExample)
        .then(function(err, res) {
            res.should.have.status(201); //https://httpstatuses.com/201
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.all.keys(expectedKey);
            res.body.title.should.equal(postExample.title);
            res.body.content.should.equal(postExample.content);
            res.body.author.should.equal(postExample).author;
        })
            done();
    });
});


it('should log error if POST req. does not meet requirements',function(done) {
    const badRequest = {};
    chai.request(app)
        .post('/blog-posts')
        .send(badRequest)
        .end(function(err, res) {
            res.should.have.status(400) //https://httpstatuses.com/400
        })
    done();
});

it('should update blog posts during PUT requests', function(done) {
	chai.request(app)
	.get('/blog-posts')
	.then(function(err, res) {
		const updatedPost = Object.assign(res.body[0], {
			title: 'Connect the dots',
			content: 'Test Test Test'
		});
		chai.request(app)
		.put(`/blog-posts/${res.body[0].id}`)
		.send(updatedPost)
		.then(function(err, res) {
			res.should.have.status(204); //https://httpstatuses.com/204
			res.should.be.json
		});
	})
	done();
});

it('Should delete posts on DELETE', function(done) {
	chai.request(app)
	.get('/blog-posts')
	.end(function(err, res) {
		chai.request(app)
		.delete(`/blog-posts/${res.body[0].id}`)
		.end(function(err, res) {
			res.should.have.status(204); //https://httpstatuses.com/204
		});
	})
	done();
});

