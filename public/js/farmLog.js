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
        yAxis: {
            title: {
                text: 'Temperature (°C)'
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
        },
        series: [],
        tooltip: {
            valueSuffix: '°C'
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get(
                            'rgba')]
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        }
    };

    chart = new Highcharts.Chart(options);

    function refreshData() {
        $.get('/log/getLog', function(data) {
            while (chart.series.length > 0)
                chart.series[0].remove(true);

            chart.addSeries({
                name: 'Soil Temperature',
                data: data.soilTemp
            });

            chart.addSeries({
                name: 'RPi Temperature',
                data: data.rpiTemp,
                visible: false
            });

            chart.addSeries({
                name: 'Arduino Temperature',
                data: data.ardTemp,
                visible: false
            });

            chart.addSeries({
                name: 'Air Temperature',
                data: data.airTemp,
                visible: false
            });

            chart.addSeries({
                name: 'Soil Humidity',
                data: data.soilHum1,
                visible: false
            });

            chart.addSeries({
                name: 'Air Humidity',
                data: data.airHum,
                visible: false
            });
         });
    }

    refreshData();
    setInterval(refreshData, 1000 * 60 * 1);
});
