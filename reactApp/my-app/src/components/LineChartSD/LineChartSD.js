
import { Line } from 'react-chartjs-2';
import React, { useEffect, useState } from 'react';
import database from '../../firebase'; 
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

export const LineChart_SD = ({user}) => {
  if (user === "My"){
    user = ''
  }
  else {
    user = user.slice(0, -2) +'/';
  }
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d'); 
  const [sittingAvg, setSittingAvg] = useState(0)
  const [standingAvg, setStandingAvg] = useState(0)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Too CLose',
        data: [],
        fill: false,
        backgroundColor: '#E72830',
        borderColor: '#E72830',
        hoverBackgroundColor: '#E72830',
      },
      {
        label: 'Perfect',
        data: [],
        fill: false,
        backgroundColor: '#78D06A',
        borderColor: '#78D06A',
        hoverBackgroundColor: '#78D06A',
      },
      {
        label: 'Too Far',
        data: [],
        fill: false,
        backgroundColor: '#CCA94D',
        borderColor: '#CCA94D',
        hoverBackgroundColor: '#CCA94D',
      },
    ],
  });

  useEffect(() => {
    const now = new Date();
    let startDate = new Date(now);
    switch (selectedTimeframe) {
      case '1d':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '2w':
        startDate = new Date(now.setDate(now.getDate() - 14));
        break;
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = now;
    }
    console.log(selectedTimeframe)
    startDate = startDate.getTime()
    console.log('in linechartSD')
  
    const postureRef = query(ref(database, user+'PostEyeScreenDistanceure'), orderByKey(), 
    startAt(startDate.toString()));
    onValue(postureRef, (snapshot) => {
      const data = snapshot.val();
        processSDData(data, startDate);
    });
    
  }, [selectedTimeframe]);

  const processSDData = (data,sdate) => {
    let counts = {};
    let totalCloseTime = 0;
    let totalPerfectTime = 0;
    let totalFarTime = 0;
  let labels = [];

  if (selectedTimeframe === '1d') {
    for (let i = 0; i < 24; i++) {
        let hour = i.toString().padStart(2, '0') + ':00'; 
        counts[hour] = { sitting: 0, standing: 0 };
        labels.push(hour);
    }
    if (data != null) {
    Object.entries(data).forEach(([timestamp, { Distance }]) => {
        const date = new Date(parseInt(timestamp));
        const hourKey = date.getHours().toString().padStart(2, '0') + ':00';

        if (counts[hourKey]) {
          if (Distance < 50) {
            totalCloseTime += 1;
            counts[hourKey]['close'] += 1;
          } else if (Distance >= 50 && Distance <= 100)  {
            totalPerfectTime += 1;
            counts[hourKey]['perfect'] += 1;
          } else if (Distance > 100) {
            totalFarTime += 1;
            counts[hourKey]['far'] += 1;
          }
      }
    });
  }
} else {
  const now = new Date();
  const startDate = new Date(sdate); 
  const endDate = new Date(now.setDate(now.getDate() ))

  for (let d = new Date(startDate); d <= endDate ; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    counts[dateKey] = { sitting: 0, standing: 0 };
  }

    if (data != null) {
  Object.entries(data).forEach(([timestamp, { Distance }]) => {
    const date = new Date(parseInt(timestamp)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  
    if (counts[date]) { 
      if (Distance < 50) {
        totalCloseTime += 1;
        counts[date]['close'] += 1;
      } else if (Distance >= 50 && Distance <= 100)  {
        totalPerfectTime += 1;
        counts[date]['perfect'] += 1;
      } else if (Distance > 100) {
        totalFarTime += 1;
        counts[date]['far'] += 1;
      }
       }

  });
  labels = Object.keys(counts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'))); 
}

  const standingData = labels.map(label => counts[label].standing);
  const sittingData = labels.map(label => counts[label].sitting);
  
    setChartData({
      labels,
      datasets: [
        { ...chartData.datasets[0], data: standingData },
        { ...chartData.datasets[1], data: sittingData },
      ],
    });
  };

  const CustomLegend = ({ chartData }) => {
    if (!chartData || !chartData) {
      return null; 
    }

    const labelsToShow = ["Too Close", "Perfect", "Too Far"]; 
    const uniqueLabels = Array.from(new Set(chartData.datasets
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
            stepSize: 5, 
          },
          gridLines: {
            color: '#3C3C3C', 
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
  console.log(data)
  return(
    <>
      <div className="navbar-wrapper">
      </div>
      <Line 
          data={chartData} 
          options={options} 
          position="relative"
      />
    </>
  ) 
}}
