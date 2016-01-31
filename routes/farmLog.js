var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('farmLog');
});

router.get('/getLog', function(req, res, next) {
  req.options.farmLog.getLog(function(data) {
    res.send(data);
  });
});

module.exports = router;
