import React from 'react';
import { Bar } from 'react-chartjs-2';

// export const BarChartPosture = () => {
//     const data = {
//       labels: ['Good', 'Average', 'Bad'],
//       datasets: [
//         {
//           label: 'Posture Quality',
//           data: [70, 25, 5], // Example data, you can replace with your own data
//           backgroundColor: ['green', 'yellow', 'red'],
//         },
//       ],
//     };
  
//     const options = {
//       scales: {
//         y: {
//           type: 'linear',
//           position: 'left',
//           beginAtZero: true,
//           max: 100,
//           title: {
//             display: true,
//             text: 'Percentage (%)',
//           },
//         },
//       },
//     };
  
//     return (
//       <div>
//         <h2>Posture Quality Chart</h2>
//         <Bar data={data} options={options} />
//       </div>
//     );
//   };

import { useEffect, useRef } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export const BarChartPosture = () => {
  const chartRef = useRef(null);
  
  const handleRef = (chart) => {
    chartRef.current = chart;
  };

  let options; // Define the options variable outside useEffect

  useEffect(() => {
    const toggleDataSeries = (e, chartRef) => {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      chartRef.current.render();
    };

    const options = {
      width: 300,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Operating Expenses of ACME",
        fontFamily: "verdana"
      },
      axisY: {
        title: "in Eur",
        includeZero: true,
        prefix: "€",
        suffix: "k"
      },
      toolTip: {
        shared: true,
        reversed: true
      },
      legend: {
        verticalAlign: "center",
        horizontalAlign: "right",
        reversed: true,
        cursor: "pointer",
        itemclick: (e) => toggleDataSeries(e, chartRef)
      },
      data: [
        {
          type: "stackedColumn",
          name: "General",
          showInLegend: true,
          yValueFormatString: "#,###k",
          dataPoints: [
            { label: "Jan", y: 14 },
            { label: "Feb", y: 12 },
            { label: "Mar", y: 14 },
            { label: "Apr", y: 13 },
            { label: "May", y: 13 },
            { label: "Jun", y: 13 },
            { label: "Jul", y: 14 },
            { label: "Aug", y: 14 },
            { label: "Sept", y: 13 },
            { label: "Oct", y: 14 },
            { label: "Nov", y: 14 },
            { label: "Dec", y: 14 }
          ]
        },
        {
          type: "stackedColumn",
          name: "Marketing",
          showInLegend: true,
          yValueFormatString: "#,###k",
          dataPoints: [
            { label: "Jan", y: 13 },
            { label: "Feb", y: 13 },
            { label: "Mar", y: 15 },
            { label: "Apr", y: 16 },
            { label: "May", y: 17 },
            { label: "Jun", y: 17 },
            { label: "Jul", y: 18 },
            { label: "Aug", y: 18 },
            { label: "Sept", y: 17 },
            { label: "Oct", y: 18 },
            { label: "Nov", y: 18 },
            { label: "Dec", y: 18 }
          ]
        },
        {
          type: "stackedColumn",
          name: "Sales",
          showInLegend: true,
          yValueFormatString: "#,###k",
          dataPoints: [
            { label: "Jan", y: 13 },
            { label: "Feb", y: 13 },
            { label: "Mar", y: 15 },
            { label: "Apr", y: 15 },
            { label: "May", y: 15 },
            { label: "Jun", y: 15 },
            { label: "Jul", y: 16 },
            { label: "Aug", y: 17 },
            { label: "Sept", y: 17 },
            { label: "Oct", y: 18 },
            { label: "Nov", y: 19 },
            { label: "Dec", y: 20 },
        ]
        },
        {
          type: "stackedColumn",
          name: "IT",
          showInLegend: true,
          yValueFormatString: "#,###k",
          dataPoints: [
            { label: "Jan", y: 14 },
            { label: "Feb", y: 8 },
            { label: "Mar", y: 6 },
            { label: "Apr", y: 6 },
            { label: "May", y: 5 },
            { label: "Jun", y: 5 },
            { label: "Jul", y: 6 },
            { label: "Aug", y: 3 },
            { label: "Sept", y: 9 },
            { label: "Oct", y: 5 },
            { label: "Nov", y: 8 },
            { label: "Dec", y: 2 },
          ]
        }]
    };

    if (chartRef.current && chartRef.current.container) {
      handleRef(chartRef.current);
    }
  }, []);

  return (
    <div>
      <CanvasJSChart options={options} onRef={handleRef} />
    </div>
  );
};