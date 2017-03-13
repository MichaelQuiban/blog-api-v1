const chai = require('chai');
const chaiHttp = require ('chai-http');

const {app, runServer, closeServer} = require('../server');

const should= chai.should();

// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Blog Posts', function() {

//Before our tests run, we activate the server. Our 'runServer'.
	before(function() {
		return runServer();
	});
//
	after(function() {
		return closeServer();
	});


	it('Should list items on GET request', function () {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');

			//The length of the body retrieved should be atleast 1. 
			res.body.length.should.be.at.least(3);

			//Each body should contain these properties in the array.
			//ID, TITLE, CONTENT, AUTHOR, PUBLISHDATE.
			const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];

			//Put the body of the object through one more hurdle.
			res.body.forEach(function(item) {
				item.should.be.a('object');
				item.should.include.keys(expectedKeys);
			});
		});
	});


});