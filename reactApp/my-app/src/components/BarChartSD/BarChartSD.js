import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './styles.css';
import database from '../../firebase.js'; // Adjust the path as needed
import { query, ref, set, onValue, orderByKey, startAt } from 'firebase/database'
import { Link } from 'react-router-dom';
import { LineChart_SD } from "../../components/LineChartSD";
import { Line } from 'react-chartjs-2';
export const BarChartSD = ({ user }) => {
  if (user === "My") {
    user = ''
  }
  else {
    //remove last 2 characters (`s)
    user = user + '/';
  }
  const [selectedTimeframeB, setselectedTimeframeB] = useState('7d'); // Default to 1 day
  const [selectedDay, setSelectedDay] = useState(null);
  const [avgDist, setAvgDist] = useState('0 hours');
  const [labels, setLabels] = useState([]);
  const [availLabels, setAvailLabels] = useState([]);
  const [dateRange, setDateRange] = useState('24/9 - 30/9');
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Too Close',
        backgroundColor: '#EE5757',
        hoverBackgroundColor: '#3199FF',
        data: [],
        fill: false,
      },
      {
        label: 'Perfect',
        backgroundColor: '#00FF00',
        fill: false,
        hoverBackgroundColor: '#FF7171',

        data: [],
      },
      {
        label: 'Too Far',
        backgroundColor: '#FFDB58',
        fill: false,
        hoverBackgroundColor: '#FF7171',

        data: [],
      },
    ],
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Too Close',
        backgroundColor: '#EE5757',
        borderWidth: 1,
        hoverBackgroundColor: '#3199FF',
        cornerRadius: 8,
        data: [],
      },
      {
        label: 'Perfect',
        backgroundColor: '#00FF00',
        borderWidth: 1,
        hoverBackgroundColor: '#FF7171',
        cornerRadius: 8,
        data: [],
      },
      {
        label: 'Too Far',
        backgroundColor: '#FFDB58',
        borderWidth: 1,
        hoverBackgroundColor: '#FF7171',
        cornerRadius: 8,
        data: [],
      },
    ],
  });
  useEffect(() => {
    const now = new Date();

    // Calculate the start date based on the selected timeframe
    let startDate = new Date(now);
    switch (selectedTimeframeB) {
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
    // console.log(selectedTimeframeB)
    //convert startDate to UnixTimestamp
    startDate = startDate.getTime()

    const postureRef = query(ref(database, user + 'EyeScreenDistance'), orderByKey(),
      startAt(startDate.toString()));
    onValue(postureRef, (snapshot) => {
      const data = snapshot.val();

      // if (data) {
      processSDData(data, startDate);
      processLineChartData(data, selectedDay);
      // }
    });

  }, [selectedTimeframeB, selectedDay]);


  const processLineChartData = (data, selectedDay) => {
    let lineTotalCloseTime = 0;
    let lineTotalPerfectTime = 0;
    let lineTotalFarTime = 0;
    let lineLabels = [];

    // Initialize your structure to hold the data for the line chart
    let lineCounts = {
      // Initialize with hours if necessary, or other structure for the selected day
    };
    for (let i = 0; i < 24; i++) {
      let hour = i.toString().padStart(2, '0') + ':00'; // Format: "HH:00"
      lineCounts[hour] = { close: 0, perfect: 0, far: 0 };
      labels.push(hour);

      // Filter and process data for the selected day
      if (data != null) {
        Object.entries(data).forEach(([timestamp, { Distance }]) => {
          const date = new Date(parseInt(timestamp));
          const dateKey = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
          

          if (selectedDay === dateKey) {
            const hourKey = date.getHours().toString().padStart(2, '0') + ':00';

            if (lineCounts[hourKey]) {
              if (Distance < 50) {
                lineTotalCloseTime += 1;
                lineCounts[hourKey]['close'] += 1;
              } else if (Distance >= 50 && Distance <= 100) {
                lineTotalPerfectTime += 1;
                lineCounts[hourKey]['perfect'] += 1;
              } else if (Distance > 100) {
                lineTotalFarTime += 1;
                lineCounts[hourKey]['far'] += 1;
              }
            }
          }
        });
      }
    }
    lineLabels = Object.keys(lineCounts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/')));

    const LineFarData = lineLabels.map(lineLabel => lineCounts[lineLabel].far);
    const LinePerfectData = lineLabels.map(lineLabel => lineCounts[lineLabel].perfect);
    const LineCloseData = lineLabels.map(lineLabel => lineCounts[lineLabel].close);


    console.log(selectedDay + ' selected day')
    setLineChartData({
      labels: lineLabels,
      datasets: [
        { ...lineChartData.datasets[0], data: LineCloseData },
        { ...lineChartData.datasets[1], data: LinePerfectData },
        { ...lineChartData.datasets[2], data: LineFarData },
      ],
    });
  }

  const processSDData = (data, sdate) => {
    let counts = {};
    // console.log(data)

    let totalCloseTime = 0;
    let totalPerfectTime = 0;
    let totalFarTime = 0;
    let distance = 0;
    let labels = [];
    if (selectedTimeframeB === '1d') {
      for (let i = 0; i < 24; i++) {
        let hour = i.toString().padStart(2, '0') + ':00'; // Format: "HH:00"
        counts[hour] = { close: 0, perfect: 0, far: 0 };
        labels.push(hour);
      }
      if (data != null) {
        Object.entries(data).forEach(([timestamp, { Distance }]) => {
          const date = new Date(parseInt(timestamp));
          const hourKey = date.getHours().toString().padStart(2, '0') + ':00';
          distance += Distance;

          if (counts[hourKey]) {
            if (Distance < 50) {
              totalCloseTime += 1;
              counts[hourKey]['close'] += 1;
            } else if (Distance >= 50 && Distance <= 100) {
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
      const startDate = new Date(sdate); // selectedStartDate should be the Unix Timestamp of your start date
      // const endDate = new Date(Math.max(...Object.keys(data).map(ts => parseInt(ts ))));
      const endDate = new Date(now.setDate(now.getDate()))

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        counts[dateKey] = { close: 0, perfect: 0, far: 0 };
      }


      // Process the actual data
      if (data != null) {
        Object.entries(data).forEach(([timestamp, { Distance }]) => {
          const date = new Date(parseInt(timestamp)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
          distance += Distance;
          if (counts[date]) { // This check is technically redundant now but left for clarity
            if (Distance < 50) {
              totalCloseTime += 1;
              counts[date]['close'] += 1;
            } else if (Distance >= 50 && Distance <= 100) {
              totalPerfectTime += 1;
              counts[date]['perfect'] += 1;
            } else if (Distance > 100) {
              totalFarTime += 1;
              counts[date]['far'] += 1;
            }
          }



        });
      }
      
      labels = Object.keys(counts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/')));
      setLabels(labels);

      let availLables = [];
      let ind = 0;

      Object.entries(counts).forEach(([date, data]) => {
        // console.log(date, data)
        // Check if all values for the hour are 0
        if (data.close === 0 && data.perfect === 0 && data.far === 0) {
        } else {
          availLables.push(ind);
        }
        ind ++
      });
      setAvailLabels(availLables);
    }

    // Prepare data for chart or output
    const farData = labels.map(label => counts[label].far);
    const perfectData = labels.map(label => counts[label].perfect);
    const closeData = labels.map(label => counts[label].close);

    // console.log('closedata' + closeData)
    // console.log('labels' + labels)
    // longestStandDuration = Math.max(...standingData);
    // longestSitDuration = Math.max(...sittingData);

    let denom = 1;
    if (selectedTimeframeB === '1d') {
      denom = 1;
    } else {
      denom = labels.length;
    }

    // setTotalClose(formatTime(totalCloseTime/denom));
    // setTotalOptimum(formatTime(totalOptimumTime/denom));
    // setTotalFar(formatTime(totalFarTime/denom));
    // setLongestStanding(formatTime(longestStandDuration));
    // setLongestSitting(formatTime(longestSitDuration));
    // setLongestBreak(formatTime(longestBreakDuration));

    setAvgDist((distance / (totalCloseTime + totalPerfectTime + totalFarTime + 0.0001)).toFixed(0));
    if (selectedTimeframeB !== '1d') {
      setDateRange(`${labels[0]} - ${labels[labels.length - 1]}`);
    } else {
      //today's date 
      const date = new Date();
      setDateRange(date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
      console.log(dateRange)
    }
    console.log(farData,perfectData,closeData)

    // let sitCaloriesBurned = 80
    // let standCaloriesBurned = 88
    // setCaloriesBurned(((totalStandTime /60) * standCaloriesBurned + (totalSitTime/60)* sitCaloriesBurned).toFixed(0))
    // updateAvgCaloriesBurned(caloriesBurned); 


    setChartData({
      labels,
      datasets: [
        { ...chartData.datasets[0], data: closeData },
        { ...chartData.datasets[1], data: perfectData },
        { ...chartData.datasets[2], data: farData },
      ],
    });

  };


  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins} minutes`;
  };



  const getUniqueLabels = (datasets) => {
    const uniqueLabels = new Set();
    datasets.forEach(dataset => uniqueLabels.add(dataset.label));
    return Array.from(uniqueLabels);
  };

  // Updated Custom Legend Component
  const CustomLegend = ({ chartData }) => {
    if (!chartData || !chartData.datasets) {
      return null;
    }

    // Filtering out specific labels
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
  const optionsLineChart = {
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

  return (
    <>
      <div className="time-interval-bar">
        <div className="group-33">
          <div className="overlap-group-4">
            <a className={`text-wrapper-27 ${selectedTimeframeB === '1d' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('1d')}>1d</a>
            <a className={`text-wrapper-29 ${selectedTimeframeB === '7d' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('7d')}>7d</a>
            <a className={`text-wrapper-28 ${selectedTimeframeB === '2w' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('2w')}>2w</a>
            <a className={`text-wrapper-23 ${selectedTimeframeB === '1m' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('1m')}>1m</a>
          </div>
        </div>
        {/* <div className="text-wrapper-30">24/9 - 30/9</div> */}
        <div className="text-wrapper-30">{dateRange}</div>
      </div>

      <div className="bar-chart-container">

        <Bar
          data={chartData}
          width={550}
          height={350}
          options={options}
          type='roundedBar'
        />
        <CustomLegend chartData={chartData} />
      </div>
      <div className="screen-distance-summary">
        <div className="average-SD">
          <div className="text-wrapper-38">Average Screen Distance</div>
          <div className="overlap-group-7">
            <div className="text-wrapper-39">{avgDist} </div>
            <div className="text-wrapper-40">  cm</div>
          </div>
        </div>
      </div>


      <div >
        <div className="screen-distance-lineChart">
          <div className="day-selection">
            {selectedTimeframeB !== "1d" &&
              labels.map((label, index) => (
                availLabels.includes(index) && (
                  <button key={index} onClick={() => setSelectedDay(label)}>
                    {label}
                  </button>
                )))}
          </div>
          {selectedTimeframeB !== "1d" &&
            <Line
              data={lineChartData}
              options={optionsLineChart}
              position="relative"
            />
          }
        </div>

      </div>

    </>
  )
}