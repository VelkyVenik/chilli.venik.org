var express = require('express');
var router = express.Router();
var config = require('../config');

router.all('*', function(req, res, next) {
  var auth =req.body.auth;
  req.options.log.info('New remote request, auth =', auth);
  if (auth === config.secret) {
    next();
  } else {
    req.options.log.warn('Remote clinet authentication failed');
    next('Remote clinet authentication failed');
  }
});

router.get('/', function(req, res, next) {
    req.options.log.info('Get Temperature');
    res.send('' + req.options.temperature);
});

router.post('/update', function(req, res, next) {
    req.options.log.info('New temperature', req.body.temp);
    req.options.db.none("insert into statistics(time, temperature) values(now(), $1)", req.body.temp)
      .then(function() {
        res.send();
      })
      .catch(function(error) {
        console.log("ERROR:", error);
        next(error);
      });
});

module.exports = router;
