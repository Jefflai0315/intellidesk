import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './style.css';

export const BarChartPosture = () => {
    const data = {
        labels: ['24/9', '25/9', '26/9', '27/9', '28/9', '29/9', '30/9'],
        datasets: [
          {
            label: 'Perfect',
            backgroundColor: '#78D06A',
            borderWidth: 1,
            hoverBackgroundColor: '#A9FF9B',
            hoverBorderColor: '#A9FF9B',
            cornerRadius: 4,
            data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
            label: 'Good',
            backgroundColor: '#F4B54C',
            borderWidth: 1,
            hoverBackgroundColor: '#FFC769',
            hoverBorderColor: '#FFC769',
            cornerRadius: 4,
            data: [45, 79, 10, 41, 16, 85, 20]
          },
          {
            label: 'Poor',
            backgroundColor: '#EE5757',
            borderWidth: 1,
            hoverBackgroundColor: '#FF7474',
            hoverBorderColor: '#FF7474',
            cornerRadius: 4,
            data: [45, 79, 10, 41, 16, 85, 20]
          }
        ]
    }

    const options={
        responsive: true,
        legend: {
            display: false,
            labels: {
              fontColor: 'white', 
            },
        },
        type:'roundedBar',
        scales: {
          xAxes: [
              {
                barPercentage: 0.95,
                categoryPercentage: 0.7,
                },
          ],
          yAxes: [
              {
                ticks: {
                    beginAtZero: true,
                    stepSize: 20, 
                },
                gridLines: {
                  color: '#3C3C3C', 
                }
              },
          ],
      },
    };

    const CustomLegend = ({ chartData }) => (
      <div className="chartjs-legend">
        <ul>
          {chartData.datasets.map((dataset, index) => (
            <li key={index}>
              <span style={{ backgroundColor: dataset.backgroundColor }}></span>
              {dataset.label}
            </li>
          ))}
        </ul>
      </div>
    );

    return (
      <>
        <Bar
          data={data}
          width={550}
          height={350}
          options={options}
          type='roundedBar'
      />
      <CustomLegend chartData={data} />
    </>  
  )   
}