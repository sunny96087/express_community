// middlewares/myMiddleware.js

module.exports = function(req, res, next) {
 console.log('Middleware 被調用了');
 next();
};