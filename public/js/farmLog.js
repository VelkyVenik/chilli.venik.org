//ESLint
/*global Highcharts*/
var chart;

jQuery(document).ready(function() {
    var options = {
        chart: {
            zoomType: 'x',
            renderTo: 'chart'

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
                text: 'Temperature',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            labels: {
                format: '{value}°C',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
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
            }]
        }, {
            title: {
                text: 'Humidity',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        series: []
   };

    chart = new Highcharts.Chart(options);

    function refreshData() {
        $.get('/log/getLog', function(data) {
            while (chart.series.length > 0)
                chart.series[0].remove(true);

            chart.addSeries({
                name: 'Soil Temperature',
                data: data.soilTemp,
                yAxis: 0,
                tooltip: {
                    valueSuffix: ' °C'
                }
            });

            chart.addSeries({
                name: 'RPi Temperature',
                data: data.rpiTemp,
                visible: false,
                yAxis: 0,
                tooltip: {
                    valueSuffix: ' °C'
                }
            });

            chart.addSeries({
                name: 'Arduino Temperature',
                data: data.ardTemp,
                visible: false,
                yAxis: 0,
                tooltip: {
                    valueSuffix: ' °C'
                }
            });

            chart.addSeries({
                name: 'Air Temperature',
                data: data.airTemp,
                visible: false,
                yAxis: 0,
                tooltip: {
                    valueSuffix: ' °C'
                }
            });

            chart.addSeries({
                name: 'Soil Humidity',
                data: data.soilHum1,
                visible: false,
                yAxis: 1,
                tooltip: {
                    valueSuffix: '%'
                }
            });

            chart.addSeries({
                name: 'Air Humidity',
                data: data.airHum,
                visible: true,
                yAxis: 1,
                tooltip: {
                    valueSuffix: '%'
                }
            });
        });
    }

    refreshData();
    setInterval(refreshData, 1000 * 60 * 1);
});
