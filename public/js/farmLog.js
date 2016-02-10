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
            selected: 0,
            buttons: [{
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
            chart.series[0].setData(data.soilTemp);
            chart.series[1].setData(data.rpiTemp);
            chart.series[2].setData(data.ardTemp);
            chart.series[3].setData(data.airTemp);
            chart.series[4].setData(data.soilHum1);
            chart.series[5].setData(data.airHum);
        });

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
    }

    addSeries();
    refreshData();
    chart.series.forEach(function(i) {
        console.log(i.name, i);
    })
    setInterval(refreshData, 1000 * 60 * 1);
});
