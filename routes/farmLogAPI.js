var express = require('express');
var router = express.Router();
var _ = require('underscore');

var config = require('../config');


router.all('*', function(req, res, next) {
  var auth = req.body.auth;
  req.options.log.info('New remote request, auth =', auth);
  if (auth === config.secret) {
    next();
  } else {
    req.options.log.warn('Remote clinet authentication failed');
    res.status(500).send('Remote clinet authentication failed');
  }
});

router.post('/add', function(req, res, next) {
  req.options.farmLog.addData(req.body, function(error) {
    if(!error) {
      res.send();
    } else {
      res.status(500).send(error);
    }
  });
});

module.exports = router;
