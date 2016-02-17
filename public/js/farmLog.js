//ESLint
/*global Highcharts*/
var chart;

// Parse GET parameters
function getParams(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}

jQuery(document).ready(function() {
    var options = {
        chart: {
            zoomType: 'x',
            renderTo: 'chart'

        },
        navigator: {
            enabled: false
        },
        rangeSelector: {
            selected: 1,
            buttons: [{
                type: 'minute',
                count: 60,
                text: 'h'
            }, {
                type: 'day',
                count: 1,
                text: 'd'
            }, {
                type: 'day',
                count: 3,
                text: '3d'
            }, {
                type: 'week',
                count: 1,
                text: 'w'
            }, {
                type: 'month',
                count: 1,
                text: 'm'
            }, {
                type: 'all',
                text: 'all'
            }]
        },
        title: {
            text: 'Chili Farm'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: null
            }
        },
        yAxis: [{
            title: {
                text: 'Temperature'
            },
            labels: {
                format: '{value}°C'
            },
            plotLines: [{
                value: 25,
                color: 'green',
                dashStyle: 'shortdash',
                width: 2,
                label: {
                    text: 'Minimum temp.'
                }
            }, {
                value: 30,
                color: 'green',
                dashStyle: 'shortdash',
                width: 2,
                label: {
                    text: 'Maximum temp.'
                }
            }],
            opposite: false
        }, {
            title: {
                text: 'Humidity'
            },
            labels: {
                format: '{value}%'
            },
            opposite: true
        }, {
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            enabled: true
        },
        series: []
    };

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    chart = new Highcharts.StockChart(options);

    function refreshData() {
        $.get('/log/getLog', function(data) {
            var params = getParams();

            // set data to chart
            $(chart.series).each(function(i, s) {
                var id = s.options.id;
                chart.get(id).setData(data[id], false);

                // show series enabled in GET parameters
                if (params[id]) {
                    chart.get(id).show();
                }
            });

            // Update selector to show the latest data
            var extremes = chart.xAxis[0].getExtremes();
            var range = extremes['max'] - extremes['min'];

            if (extremes['max'] < extremes['dataMax']) {
                chart.xAxis[0].setExtremes(extremes['dataMax'] - range, extremes['dataMax'], false);
            }

            chart.redraw();
        });

    }

    function seriesFormatterStatus() {
        var status = 'off';
        if (this.y > 0)
            status = 'on';

        return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + status + '</b><br/>'
    }

    function addSeries() {
        chart.addSeries({
            id: 'soilTemp',
            name: 'Soil Temperature',
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        chart.addSeries({
            id: 'rpiTemp',
            name: 'RPi Temperature',
            visible: false,
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        //chart.addSeries({
            //id: 'ardTemp',
            //name: 'Arduino Temperature',
            //visible: false,
            //yAxis: 0,
            //tooltip: {
                //valueSuffix: ' °C'
            //}
        //});

        chart.addSeries({
            id: 'airTemp',
            name: 'Air Temperature',
            visible: false,
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        //chart.addSeries({
            //id: 'soilHum1',
            //name: 'Soil Humidity',
            //visible: false,
            //yAxis: 1,
            //tooltip: {
                //valueSuffix: '%'
            //}
        //});

        chart.addSeries({
            id: 'airHum',
            name: 'Air Humidity',
            visible: false,
            yAxis: 1,
            tooltip: {
                valueSuffix: '%'
            }
        });

        chart.addSeries({
            id: 'heating',
            name: 'Heating',
            visible: false,
            yAxis: 2,
            tooltip: {
                pointFormatter: seriesFormatterStatus
            }
        });

        chart.addSeries({
            id: 'light',
            name: 'Light',
            visible: false,
            yAxis: 2,
            tooltip: {
                pointFormatter: seriesFormatterStatus
            }
        });

    }

    addSeries();
    refreshData();
    setInterval(refreshData, 1000 * 60 * 1);
});
