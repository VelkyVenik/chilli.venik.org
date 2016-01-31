var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var bunyan = require('bunyan')
var bunyanDebugStream = require('bunyan-debug-stream')

var generalRoutes = require('./routes/index')
var farmLogRoutes = require('./routes/farmLog')
var farmLogAPI = require('./routes/farmLogAPI')


var reqLogger = require('./src/expressLogger')
var farmLog = require('./src/farmLog')
var config = require('./config')

var app = express()

var logger = bunyan.createLogger({
    name: 'chilli',
    serializers: bunyanDebugStream.serializers,
    streams: [{
        level: (app.get('env') === 'development') ? 'debug' : 'info',
        level: 'trace',
        type: 'raw',
        stream: bunyanDebugStream({
            basepath: __dirname, // this should be the root folder of your project.
            forceColor: true,
            prefixers: {
                'widget_type': function(foo) {
                    return foo
                }
            },
            colors: {
                'debug': 'green',
                'info': 'blue',
                'warn': 'red',
                'error': ['red', 'bold']
            }
        })
    }]
})
app.log = logger // hack :)

var promise = require('bluebird');
var pgp = require('pg-promise')({
    promiseLib: promise
});
var db = pgp(config.db.conn);

var options = {}
options['log'] = logger
options['app'] = app
options['db'] = db
options['farmLog'] = new farmLog(options)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(reqLogger({
    logger: logger
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
// app.use(favicon(__dirname + '/public/favicon.ico'));

// Make our options accessible to our router
app.use(function(req, res, next) {
    req.options = options
    next()
})

// Routing
app.use('/', generalRoutes)
app.use('/log', farmLogRoutes)
app.use('/farmLog', farmLogAPI)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})


module.exports = app
