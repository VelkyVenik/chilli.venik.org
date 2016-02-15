var moment = require('moment');
var _ = require('underscore');

var dataItems = ['sysUpTime', 'soilTemp', 'airTemp', 'rpiTemp', 'ardTemp', 'soilHum1', 'soilHum2', 'airHum',
    'heating', 'light'
];


function farmLog(options) {
    this.options = options;
    this.db = options.db;
    this.log = options.log.child({
        widget_type: 'farmLog'
    });

    this.getLastData = function(cb) {
        this.db.one('select * from "farmLog" order by timestamp desc limit 1')
            .then(function(data) {
                data['lastUpdate'] = moment(data.timestamp).calendar();
                cb(data);
            })
            .catch(function(error) {
                console.error(error);
                cb(error);
            })
    }

    this.addData = function(data, cb) {
        var that = this;
        var items = '';
        var values = '';

        this.log.debug('Received new data', data);

        values = _.filter(dataItems, function(i) {
            return data[i];
        });
        items = _.map(values, function(i) {
            return '"' + i + '"';
        }).join();
        values = _.map(values, function(i) {
            return '${' + i + '}';
        }).join();
        this.log.trace('items', items);
        this.log.trace('values', values);

        var query = 'insert into "farmLog" (' + items + ') values(' + values + ')';
        this.log.trace('DB query', query);
        this.db.none(query, data)
            .then(function() {
                that.log.info('New data added', data);
                cb();
            })
            .catch(function(error) {
                that.log.warn(error);
                cb(error);
            })
    }

    this.getLog = function(cb) {
        this.db.query('select * from "farmLog" order by timestamp asc')
            .then(function(data) {
                var retval = {};

                _.each(data, function(record) {
                    _.each(dataItems, function(item) {
                        if (_.contains(['timestamp', 'sysUpTime'], item))
                            return;
                        
                        var m = 1;
                        if (_.contains(['heating', 'light'], item))
                            m = 10;

                        if (!retval[item])
                            retval[item] = [];
                        if ((record[item]) || (record[item] == '0'))
                            retval[item].push([moment(record.timestamp).valueOf(), parseFloat(record[item]) * m]);
                    });
                });

                cb(retval);
            })
            .catch(function(error) {
                console.error(error);
                cb(error);
            })
    }
}

module.exports = farmLog;
