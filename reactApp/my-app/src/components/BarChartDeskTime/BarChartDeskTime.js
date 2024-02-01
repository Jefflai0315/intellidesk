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
            cornerRadius: 8,
            data: [65, 59, 80, 81, 56, 55, 40],
          },
          {
            label: 'Sitting',
            backgroundColor: '#EE5757',
            borderWidth: 1,
            hoverBackgroundColor: '#FF7171',
            cornerRadius: 8,
            data: [45, 79, 10, 41, 16, 85, 20],
          },
          {
            label: 'Standing Stack',
            backgroundColor: '#1679DB',
            borderWidth: 1,
            hoverBackgroundColor: '#1679DB',
            cornerRadius: 8,
            data: [15, 30, 20, 15, 24, 15, 50], 
          },
          {
            label: 'Sitting Stack',
            backgroundColor: '#EE5757',
            borderWidth: 1,
            hoverBackgroundColor: '#EE5757',
            cornerRadius: 8,
            data: [15, 20, 20, 31, 14, 25, 20], 
          },
        ],
    }

    // Function to get unique labels for legend
    const getUniqueLabels = (datasets) => {
      const uniqueLabels = new Set();
      datasets.forEach(dataset => uniqueLabels.add(dataset.label));
      return Array.from(uniqueLabels);
    };

    // Updated Custom Legend Component
    const CustomLegend = ({ chartData }) => {
        if (!data || !data.datasets) {
          return null; 
        }

        // Filtering out specific labels
        const labelsToShow = ["Standing", "Sitting"]; 
        const uniqueLabels = Array.from(new Set(data.datasets
          .filter(dataset => labelsToShow.includes(dataset.label))
          .map(dataset => dataset.label)));

        return (
            <div className="chartjs-legend">
                <ul>
                    {uniqueLabels.map((label, index) => {
                        const dataset = chartData.datasets.find(d => d.label === label);
                        return (
                            <li key={index}>
                                <span style={{ backgroundColor: dataset.backgroundColor }}></span>
                                {label}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    const options={
        responsive: true,
        legend: {
            display: false,
            labels: {
              fontColor: 'white', 
              filter: function (legendItem, chartData) {
                const labelIndex = chartData.labels.indexOf(legendItem.text);
                return chartData.datasets.findIndex(dataset => dataset.label === legendItem.text) === labelIndex;
              }
            },
        },
        scales: {
          xAxes: [
              {
                stacked: true,
                barPercentage: 0.9, 
                categoryPercentage: 0.6, 
              },
          ],
          yAxes: [
              {
                stacked: true,
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