import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './styles.css';

export const BarChartDeskTime = () => {
    const data = {
        labels: ['24/9', '25/9', '26/9', '27/9', '28/9', '29/9', '30/9'],
        datasets: [
          {
            label: 'Standing',
            backgroundColor: '#1679DB',
            borderWidth: 1,
            hoverBackgroundColor: '#3199FF',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderRadius: 5,
          },
          {
            label: 'Sitting',
            backgroundColor: '#EE5757',
            borderWidth: 1,
            hoverBackgroundColor: '#FF7171',
            data: [45, 79, 10, 41, 16, 85, 20],
            borderRadius: 5,
          },
        ],
    }

    const options={
        responsive: true,
        legend: {
            display: false,
            labels: {
              fontColor: 'white', // You can customize the legend label color
            },
        },
        scales: {
          xAxes: [
              {
                stacked: true,
                },
          ],
          yAxes: [
              {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    stepSize: 20, // Adjust the step size as needed
                },
                gridLines: {
                  color: '#3C3C3C', // Change x-axis grid lines color
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