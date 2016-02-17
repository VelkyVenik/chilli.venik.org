//ESLint
/*global Highcharts*/
var chart;

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
            chart.series[0].setData(data.soilTemp, false);
            chart.series[1].setData(data.rpiTemp, false);
            chart.series[2].setData(data.ardTemp, false);
            chart.series[3].setData(data.airTemp, false);
            chart.series[4].setData(data.soilHum1, false);
            chart.series[5].setData(data.airHum, false);
            chart.series[6].setData(data.heating, false);
            chart.series[7].setData(data.light, false);

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
            name: 'Soil Temperature',
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        chart.addSeries({
            name: 'RPi Temperature',
            visible: false,
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        chart.addSeries({
            name: 'Arduino Temperature',
            visible: false,
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        chart.addSeries({
            name: 'Air Temperature',
            visible: false,
            yAxis: 0,
            tooltip: {
                valueSuffix: ' °C'
            }
        });

        chart.addSeries({
            name: 'Soil Humidity',
            visible: false,
            yAxis: 1,
            tooltip: {
                valueSuffix: '%'
            }
        });

        chart.addSeries({
            name: 'Air Humidity',
            visible: false,
            yAxis: 1,
            tooltip: {
                valueSuffix: '%'
            }
        });

        chart.addSeries({
            name: 'Heating',
            visible: false,
            yAxis: 2,
            tooltip: {
                pointFormatter: seriesFormatterStatus
            }
        });

        chart.addSeries({
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
