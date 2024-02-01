import React from 'react';
import { Line } from 'react-chartjs-2';

export const LineChart_DeskTime = () => {
  const data = {
    labels: ['24/9', '25/9', '26/9', '27/9', '28/9', '29/9', '30/9'],
    datasets: [
      {
        label: 'Standing',
        data: [12, 19, 3, 5, 2, 3, 20],
        fill: false,
        backgroundColor: '#1679DB',
        borderColor: '#1679DB',
        hoverBackgroundColor: '#3199FF',
      },
      {
        label: 'Sitting',
        data: [1, 2, 1, 1, 2, 2, 14],
        fill: false,
        backgroundColor: '#EE5757',
        borderColor: '#EE5757',
        hoverBackgroundColor: '#FF7171',
      },
    ],
  };

  // Updated Custom Legend Component
  const CustomLegend = ({ chartData }) => {
    if (!data || !data.datasets) {
      return null; // Ensures data is defined before rendering the legend
    }

    // Filtering out specific labels
    const labelsToShow = ["Standing", "Sitting"]; // Add labels you want to show
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

  const options = {
    responsive: true,
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          id: 'y-axis-1',
          ticks: {
            beginAtZero: true,
            stepSize: 5, // Adjust the step size as needed
          },
          gridLines: {
            color: '#3C3C3C', // Change x-axis grid lines color
          }
        },
      ],
    },
    legend: {
        display: false,
        labels: {
          fontColor: 'white', 
        },
    },
  };

  return(
    <>
        <Line 
            data={data} 
            options={options} 
            position="relative"
        />
        <CustomLegend chartData={data} />
    </>
  ) 
};
