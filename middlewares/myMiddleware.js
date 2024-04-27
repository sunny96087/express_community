// middlewares/myMiddleware.js

module.exports = function(req, res, next) {
 console.log('叩叩叩 有人進來了...');
 next();
};