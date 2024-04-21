var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // #swagger.tags = ['Index']
  // #swagger.description = 'express 預設首頁，目前沒用'
  res.render('index', { title: 'Express' });
});

module.exports = router;
