import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './styles.css';
import database from '../../firebase'; 
import { query, ref, set, onValue, orderByKey, startAt } from 'firebase/database'
import { Link } from 'react-router-dom';

export const BarChartDeskTime = ({ user }) => {
  if (user === "My") {
    user = ''
  }
  else {
    user = user + '/';
  }
  const [selectedTimeframeB, setselectedTimeframeB] = useState('7d'); 
  const [avgHour, setAvgHour] = useState('0 hours');
  const [totalStanding, setTotalStanding] = useState('0 hours');
  const [totalSitting, setTotalSitting] = useState('0 hours');
  const [totalBreak, setTotalBreak] = useState('0 minutes');
  const [longestStanding, setLongestStanding] = useState('0 hours');
  const [longestSitting, setLongestSitting] = useState('0 hours');
  const [longestBreak, setLongestBreak] = useState('0 minutes');
  const [dateRange, setDateRange] = useState('24/9 - 30/9');
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Standing',
        backgroundColor: '#1679DB',
        borderWidth: 1,
        hoverBackgroundColor: '#3199FF',
        cornerRadius: 8,
        data: [],
      },
      {
        label: 'Sitting',
        backgroundColor: '#EE5757',
        borderWidth: 1,
        hoverBackgroundColor: '#FF7171',
        cornerRadius: 8,
        data: [],
      },
    ],
  });
  useEffect(() => {
    const now = new Date();

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
        startDate = now; 
    }
    console.log(selectedTimeframeB)
    startDate = startDate.getTime()

    const postureRef = query(ref(database, user + 'Posture'), orderByKey(),
      startAt(startDate.toString()));
    onValue(postureRef, (snapshot) => {
      const data = snapshot.val();

      processSitStandData(data, startDate);
    });


  }, [selectedTimeframeB]);

  const updateAvgCaloriesBurned = (data) => {
    const caloriesBurnedRef = ref(database, user + 'Params/CaloriesBurned');
    set(caloriesBurnedRef, data).catch((error) => {
      console.error("Error updating height in Firebase", error);
    });
  };

  const processSitStandData = (data, sdate) => {
    let counts = {};

    let totalStandTime = 0;
    let totalSitTime = 0;
    let totalBreakTime = 0;
    let longestStandDuration = 0;
    let longestSitDuration = 0;
    let longestBreakDuration = 0;
    let labels = [];
    if (selectedTimeframeB === '1d') {
      for (let i = 0; i < 24; i++) {
        let hour = i.toString().padStart(2, '0') + ':00'; 
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
          if (PostureMode === "sitting") {
            totalSitTime += 1;
          } else {
            totalStandTime += 1;
          }
        });
      }
    } else {
      const now = new Date();
      const startDate = new Date(sdate); 
      const endDate = new Date(now.setDate(now.getDate()))

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        counts[dateKey] = { sitting: 0, standing: 0 };
      }

      if (data != null) {
        Object.entries(data).forEach(([timestamp, { PostureMode }]) => {
          const date = new Date(parseInt(timestamp)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
          if (counts[date]) { 
            counts[date][PostureMode] += 1;

            if (PostureMode === "sitting") {
              totalSitTime += 1;
            } else {
              totalStandTime += 1;
            }
          }
        });
      }
      labels = Object.keys(counts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/')));
    }
    const standingData = labels.map(label => counts[label].standing);
    const sittingData = labels.map(label => counts[label].sitting);
    longestStandDuration = Math.max(...standingData);
    longestSitDuration = Math.max(...sittingData);

    let denom = 1;
    if (selectedTimeframeB === '1d') {
      denom = 1;
    } else {
      denom = labels.length;
    }

    setTotalStanding(formatTime(totalStandTime / denom));
    setTotalSitting(formatTime(totalSitTime / denom));
    setTotalBreak(formatTime(totalBreakTime / denom));
    setLongestStanding(formatTime(longestStandDuration));
    setLongestSitting(formatTime(longestSitDuration));
    setLongestBreak(formatTime(longestBreakDuration));
    const min = (((totalStandTime + totalSitTime) / denom))
    setAvgHour((Math.floor(min / 60) + ((min % 60) / 60)).toFixed(1));
    if (selectedTimeframeB !== '1d') { 
      setDateRange(`${labels[0]} - ${labels[labels.length - 1]}`);
    }else{
      const date = new Date();
      setDateRange(date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
      console.log(dateRange)
    }

    let sitCaloriesBurned = 80
    let standCaloriesBurned = 88
    setCaloriesBurned(((totalStandTime / 60) * standCaloriesBurned + (totalSitTime / 60) * sitCaloriesBurned).toFixed(0))
    updateAvgCaloriesBurned(caloriesBurned);


    setChartData({
      labels,
      datasets: [
        { ...chartData.datasets[0], data: standingData },
        { ...chartData.datasets[1], data: sittingData },
      ],
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = (minutes % 60).toFixed(0);
    return `${hours} hours ${mins} minutes`;
  };



  const getUniqueLabels = (datasets) => {
    const uniqueLabels = new Set();
    datasets.forEach(dataset => uniqueLabels.add(dataset.label));
    return Array.from(uniqueLabels);
  };

  const CustomLegend = ({ chartData }) => {
    if (!chartData || !chartData.datasets) {
      return null;
    }

    const labelsToShow = ["Standing", "Sitting"];
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
        <CustomLegend  chartData={chartData} />
      </div>
      <div className="desk-time-summary">
        <div className="average-DT">
          <div className="text-wrapper-38">Average</div>
          <div className="overlap-group-7">
            <div className="text-wrapper-39">{avgHour}</div>
            <div className="text-wrapper-40">hrs/day</div>
          </div>
        </div>
      </div>
      <div className="group-wrapper">
        <div className="group-37">
          <div className="average-SD-2">
            <div className="overlap-group-8">
              <div className="text-wrapper-41">Longest Standing</div>
              <div className="text-wrapper-42">{longestStanding}</div>
            </div>
          </div>
          <div className="closest">
            <div className="overlap-group-8">
              <div className="text-wrapper-43">{longestSitting}</div>
              <div className="text-wrapper-41">Longest Sitting</div>
            </div>
          </div>
          <div className="closest-2">
            <div className="overlap-8">
              <div className="text-wrapper-44">{longestBreak}</div>
              <div className="text-wrapper-45">Longest Break</div>
            </div>
          </div>
          <div className="closest-3">
            <div className="overlap-9">
              <div className="text-wrapper-46">{totalSitting}</div>
              <div className="text-wrapper-47">Total Sitting</div>
            </div>
          </div>
          <div className="closest-4">
            <div className="overlap-10">
              <div className="text-wrapper-48">{totalBreak}</div>
              <div className="text-wrapper-49">Total Break</div>
            </div>
          </div>
          <div className="closest-5">
            <div className="overlap-10">
              <div className="text-wrapper-50">{totalStanding}</div>
              <div className="text-wrapper-49">Total Standing</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}