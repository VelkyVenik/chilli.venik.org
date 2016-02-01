var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.options.farmLog.getLastData(function(data) {
        res.render('index', data);
    });
});

module.exports = router;
