var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    req.options.log.info('Get Temperature');
    res.send('' + req.options.temperature);
});

router.post('/update', function(req, res, next) {
    req.options.log.info('New temperature', req.body.temp);
    req.options.temperature = req.body.temp;
    res.send();
});

module.exports = router;
