import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './style.css';

export const BarChartSD_Home = () => {
    const data = {
        labels: ['Too Close', 'Perfect', 'Too Far'],
        datasets: [
          {
            label: 'Distance from Screen',
            backgroundColor: ['#EE5757', '#78D06A', '#F4B54C'],
            borderWidth: 1,
            hoverBackgroundColor: ['#FF7474', '#A9FF9B', '#FFC769'],
            hoverBorderColor: ['#FF7474', '#A9FF9B', '#FFC769'],
            data: [65, 35, 45]
          }
        ]
    }

    const options={
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false,
            labels: {
              fontColor: 'white', // You can customize the legend label color
            },
        },
        type:'roundedBar',
        scales: {
          xAxes: [
              {
                barPercentage: 0.5,
                categoryPercentage: 0.8,
                gridLines: {
                    color: '#252525'
                  }
                },
          ],
          yAxes: [
              {
                ticks: {
                    beginAtZero: true,
                    stepSize: 20, // Adjust the step size as needed
                },
                gridLines: {
                  color: '#252525'
                }
              },
          ],
      },
    };

    return (  
        <div style={{ position: 'absolute', top: '430px', width: '70%', height: '170px', left: '20px' }}> {/* Adjust the height as needed */}
            <Bar data={data} options={options} />
        </div> 
  )   
}