const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');

//Allow the use of syntax available through chai.
chai.use(chaiHttp);

describe('Blog Posts')

before(function() {
    return runServer();
  });

after(function() {
    return closeServer();
  });