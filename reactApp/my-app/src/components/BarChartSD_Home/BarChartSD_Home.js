import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './style.css';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

export const BarChartSD_Home = () => {
  const [avg, setAvg] = useState(0)
  const [closest, setClosest] = useState(0)
    const [chartData, setChartData] = useState({
        labels: ['Too Close', 'Perfect', 'Too Far'],
        datasets: [
          {
            label: 'Distance from Screen',
            backgroundColor: ['#EE5757', '#78D06A', '#F4B54C'],
            borderWidth: 1,
            hoverBackgroundColor: ['#FF7474', '#A9FF9B', '#FFC769'],
            hoverBorderColor: ['#FF7474', '#A9FF9B', '#FFC769'],
            data: []
          }
        ]
    });

    useEffect(() => {
      const now = new Date();
      let startDate = new Date(now.setDate(now.getDate() -7))
      console.log(startDate)
      const ESRef = query(ref(database, 'EyeScreenDistance'), orderByKey(), 
    startAt(startDate.getTime().toString())); // 7 days
    onValue(ESRef, (snapshot) => {
      const data = snapshot.val();

      // if (data) {
      processESData(data, startDate);
      // }
    });
  }, );

  const processESData = (data,sdate) => {
    let counts = [0,0,0];
    let avg = 0;
    let min = 1000;

  Object.entries(data).forEach(([timestamp, {Distance}]) => {
    avg += Distance;
    if (min > Distance ){
      min = Distance;
    }
    if (Distance < 50) {
      counts[0] += 1;
    }
    else if (Distance >= 50 && Distance <= 100) {
      counts[1] += 1;
    }else if (Distance > 100) {
      counts[2] += 1;
    }
  } 
  )
  console.log(counts);
  setAvg((avg/counts.reduce((a, b) => a + b, 0)).toFixed(1));
  setClosest(min);
  setChartData({
    datasets: [
      {...chartData.datasets[0], data: counts },
    ]
  });
}


    const options={
        responsive: true,
        maintainAspectRatio: false,
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
                    stepSize: 20, 
                },
                gridLines: {
                  color: '#252525'
                }
              },
          ],
      },
    };

    return (  
      <>
        <div style={{ position: 'absolute', top: '430px', width: '70%', height: '170px', left: '20px' }}> {/* Adjust the height as needed */}
            <Bar data={chartData} options={options} />
        </div> 
        <div className="average-SD">
          <div className="overlap-group-2">
            <div className="text-wrapper-6">Average</div>
            <div className="text-wrapper-7">{avg} cm</div>
          </div>
        </div>
        <div className="closest">
          <div className="overlap-3">
            <div className="text-wrapper-8">{closest}cm</div>
            <div className="text-wrapper-6">Closest</div>
          </div>
        </div>
      </>
  )   
}