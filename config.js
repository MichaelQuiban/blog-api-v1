exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://testuser:123456@ds143980.mlab.com:43980/blog-app';
exports.PORT = process.env.PORT || 8080;