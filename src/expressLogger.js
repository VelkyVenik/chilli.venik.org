module.exports = function logRequest(options) {
    var logger = options.logger;
    var count = 0;
    var headerName = 'x-request-id';

    return function(req, res, next) {
        var id = req.headers[headerName] || count++;

        req.log = logger.child({
            widget_type: 'HTTP#' + id
        });

        res.setHeader(headerName, id);
        req.log.debug({
            req: req,
            res: res
        });

        var time = process.hrtime();
        res.on('finish', function responseSent() {
            var diff = process.hrtime(time);
            res.responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
            req.log.info({
                req: req,
                res: res
            });
        });

        next();
    };
};
