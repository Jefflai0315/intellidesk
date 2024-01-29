import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../../components/customChartTypes.js';
import './styles.css';

export const BarChartPosture = () => {
    const data = {
        labels: ['24/9', '25/9', '26/9', '27/9', '28/9', '29/9', '30/9'],
        datasets: [
          {
            label: 'Perfect',
            backgroundColor: '#78D06A',
            // borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
            label: 'Good',
            backgroundColor: '#F4B54C',
            // borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [45, 79, 10, 41, 16, 85, 20]
          },
          {
            label: 'Poor',
            backgroundColor: '#EE5757',
            // borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [45, 79, 10, 41, 16, 85, 20]
          }
        ]
    }

    const options={
        responsive: true,
        legend: {
            display: true,
            labels: {
              fontColor: 'white', // You can customize the legend label color
            },
        },
        type:'roundedBar',
        scales: {
          xAxes: [
              {
              },
          ],
          yAxes: [
              {
                  ticks: {
                      beginAtZero: true,
                      stepSize: 20, // Adjust the step size as needed
                  },
              },
          ],
      },
    };

    return (
      <Bar
          data={data}
          width={null}
          height={null}
          options={options}
      />
  )   
}