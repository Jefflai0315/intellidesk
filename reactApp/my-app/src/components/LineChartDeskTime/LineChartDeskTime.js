
import { Line } from 'react-chartjs-2';
import React, { useEffect, useState } from 'react';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

export const LineChart_DeskTime = ({user}) => {
  if (user === "My"){
    user = ''
  }
  else {
    //remove last 2 characters (`s)
    user = user.slice(0, -2) +'/';
  }
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d'); // Default to 1 day
  const [sittingAvg, setSittingAvg] = useState(0)
  const [standingAvg, setStandingAvg] = useState(0)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Standing',
        data: [],
        fill: false,
        backgroundColor: '#1679DB',
        borderColor: '#1679DB',
        hoverBackgroundColor: '#3199FF',
      },
      {
        label: 'Sitting',
        data: [],
        fill: false,
        backgroundColor: '#EE5757',
        borderColor: '#EE5757',
        hoverBackgroundColor: '#FF7171',
      },
    ],
  });

  useEffect(() => {
    const now = new Date();

    // Calculate the start date based on the selected timeframe
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
        startDate = now; // Default to current day as start date
    }
    console.log(selectedTimeframe)
    //convert startDate to UnixTimestamp
    startDate = startDate.getTime()
  
    const postureRef = query(ref(database, user+'Posture'), orderByKey(), 
    startAt(startDate.toString()));
    onValue(postureRef, (snapshot) => {
      const data = snapshot.val();

      // if (data) {
      processSitStandData(data, startDate);
      // }
    });
    
  }, [selectedTimeframe]);

  const processSitStandData = (data,sdate) => {
    let counts = {};
  let totalSitting = 0;
  let totalStanding = 0;
  let labels = [];

  if (selectedTimeframe === '1d') {
    // Initialize counts for each hour of the day
    for (let i = 0; i < 24; i++) {
        let hour = i.toString().padStart(2, '0') + ':00'; // Format: "HH:00"
        counts[hour] = { sitting: 0, standing: 0 };
        labels.push(hour);
    }
    if (data != null) {
    Object.entries(data).forEach(([timestamp, { PostureMode }]) => {
        const date = new Date(parseInt(timestamp));
        const hourKey = date.getHours().toString().padStart(2, '0') + ':00';

        

        if (counts[hourKey]) {
            counts[hourKey][PostureMode] += 1;
        }
    });
  }
} else {
  const now = new Date();
  const startDate = new Date(sdate); // selectedStartDate should be the Unix Timestamp of your start date
  // const endDate = new Date(Math.max(...Object.keys(data).map(ts => parseInt(ts ))));
  const endDate = new Date(now.setDate(now.getDate() ))

  for (let d = new Date(startDate); d <= endDate ; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    counts[dateKey] = { sitting: 0, standing: 0 };
  }

  // Process the actual data
  if (data != null) {
  Object.entries(data).forEach(([timestamp, { PostureMode }]) => {
    const date = new Date(parseInt(timestamp)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    if (counts[date]) { // This check is technically redundant now but left for clarity
      counts[date][PostureMode] += 1;

      if (PostureMode === "sitting") {
        totalSitting += 1;
      } else {
        totalStanding += 1;
      }
    }
  });
}
  labels = Object.keys(counts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'))); 
}

  // Prepare data for chart or output
  const standingData = labels.map(label => counts[label].standing);
  const sittingData = labels.map(label => counts[label].sitting);

  
  
   
    setSittingAvg((totalSitting/sittingData.length).toFixed(1));
    setStandingAvg((totalStanding/standingData.length).toFixed(1));


    setChartData({
      labels,
      datasets: [
        { ...chartData.datasets[0], data: standingData },
        { ...chartData.datasets[1], data: sittingData },
      ],
    });
  };

  // Updated Custom Legend Component
  const CustomLegend = ({ chartData }) => {
    if (!chartData || !chartData) {
      return null; // Ensures data is defined before rendering the legend
    }

    // Filtering out specific labels
    const labelsToShow = ["standing", "sitting"]; // Add labels you want to show
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
        <div className="navbar-wrapper">
          <div className="navbar">
            <a className={`text-wrapper-25 ${selectedTimeframe === '1d' ? 'active' : ''}`} onClick={() => setSelectedTimeframe('1d')}>1d</a>
            <a className={`text-wrapper-26 ${selectedTimeframe === '7d' ? 'active' : ''}`} onClick={() => setSelectedTimeframe('7d')}>7d</a>
            <a className={`text-wrapper-27 ${selectedTimeframe === '2w' ? 'active' : ''}`} onClick={() => setSelectedTimeframe('2w')}>2w</a>
            <a className={`text-wrapper-28 ${selectedTimeframe === '1m' ? 'active' : ''}`} onClick={() => setSelectedTimeframe('1m')}>1m</a>
            
          </div>
        </div>
        <Line 
            data={chartData} 
            options={options} 
            position="relative"
        />
        <CustomLegend chartData={chartData} />
        <div className="average-DT">
          <div className="text-wrapper-14">Average Standing</div>
          <div className="overlap-group-3">
            <div className="text-wrapper-15">{standingAvg}</div>
            <div className="text-wrapper-16">hrs/day</div>
          </div>
        </div>
        <div className="average-DT-2">
          <div className="text-wrapper-14-2">Average Sitting</div>
          <div className="overlap-group-3-2">
            <div className="text-wrapper-15-2">{sittingAvg}</div>
            <div className="text-wrapper-16-2">hrs/day</div>
          </div>
        </div>
    </>
  ) 
};
