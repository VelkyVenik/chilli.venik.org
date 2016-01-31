//ESLint
/*global Highcharts*/
var chart;

jQuery(document).ready(function() {
  var options = {
    chart: {
      zoomType: 'x',
      renderTo: 'chart',

    },
    title: {
      text: 'Chili Farm'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: null
      },
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },

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
    },
  };

  chart = new Highcharts.Chart(options);

  function refreshData() {
    $.get('/log/getLog', function(data) {
      while (chart.series.length > 0)
        chart.series[0].remove(true);

      chart.addSeries({
        name: 'Temperature',
        data: data,
      });
    });
  }

  refreshData();
  setInterval(refreshData, 1000 * 60 * 5);
});