var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.options.db.one('select temperature from statistics order by time desc limit 1')
    .then(function(data){
      res.render('index', data);
    })
    .catch(function(error){
      next(error);
    });

});

module.exports = router;
