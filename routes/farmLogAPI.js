var express = require('express');
var router = express.Router();
var _ = require('underscore');
var multer  = require('multer');
var mv = require('mv');

var config = require('../config');

var upload = multer({ dest: config.uploadDir });

router.all('*', upload.single('photo'), function(req, res, next) {
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

// how to - curl -i -X POST http://localhost:3000/farmLog/currentPhoto -F auth=XX -F photo=@./a.jpg
router.post('/currentPhoto', upload.single('photo'), function(req, res, next) {
  req.options.log.info("New photo uploaded", req.file.originalname, '(', req.file.size/1024/1024, 'MB)');
  mv(req.file.path, './public/img/latestPhoto.jpg', function(err) {
      if (err) {
        req.options.log.warn(err);
        res.send(err);
      } else {
        res.send();
      }
  });
});

module.exports = router;
