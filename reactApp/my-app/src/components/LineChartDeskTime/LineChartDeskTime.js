
import { Line } from 'react-chartjs-2';
import React, { useEffect, useState } from 'react';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

export const LineChart_DeskTime = () => {
  // const data = {
    
  //   labels: ['24/9', '25/9', '26/9', '27/9', '28/9', '29/9', '30/9'],
  //   datasets: [
  //     {
  //       label: 'Standing',
  //       data: [12, 19, 3, 5, 2, 3, 20],
  //       fill: false,
  //       backgroundColor: '#1679DB',
  //       borderColor: '#1679DB',
  //       hoverBackgroundColor: '#3199FF',
  //     },
  //     {
  //       label: 'Sitting',
  //       data: [1, 2, 1, 1, 2, 2, 14],
  //       fill: false,
  //       backgroundColor: '#EE5757',
  //       borderColor: '#EE5757',
  //       hoverBackgroundColor: '#FF7171',
  //     },
  //   ],
  // };
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
    let startDate;
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

    //convert startDate to UnixTimestamp
    startDate = startDate.getTime()
    now.setDate(now.getDate());
    console.log(startDate.toString())

    const postureRef = query(ref(database, 'Posture'), orderByKey(), 
    startAt(startDate.toString()));
    onValue(postureRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        processSitStandData(data);
      }
    });
  }, [selectedTimeframe]);

  const processSitStandData = (data) => {
    let countsByDay = {};
    let totalSitting = 0;
    let totalStanding = 0;

    Object.entries(data).forEach(([unixtimestamp, { PostureMode }]) => {
      const date = new Date(parseInt(unixtimestamp) ).toLocaleDateString();
      if (!countsByDay[date]) {
        countsByDay[date] = { sitting: 0, standing: 0 };
      }
      console.log(PostureMode)
      countsByDay[date][PostureMode] += 1;
      if (PostureMode === "sitting") {
      totalSitting += 1
      }else{
      totalStanding += 1
      }
    });
    console.log(countsByDay)
    const labels = Object.keys(countsByDay);
    const standingData = labels.map(label => countsByDay[label].standing || 0);
    const sittingData = labels.map(label => countsByDay[label].sitting || 0);

   
    setSittingAvg(totalSitting/sittingData.length);
    setStandingAvg(totalStanding/standingData.length);


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
