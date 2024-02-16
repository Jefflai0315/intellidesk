import React, { useEffect, useState }from 'react';
import { Bar } from 'react-chartjs-2';
import '../customChartTypes.js';
import './style.css';
import { PostureAngle } from "../../components/PostureAngle";

import database from '../../firebase'; // Adjust the path as needed
import { get,query, set, ref, onValue, orderByKey , startAt} from 'firebase/database'
// import { ref, set , query, limitToLast, onValue, startAt, endAt, orderByKey} from 'firebase/database';


export const BarChartPosture = ({user}) => {
  if (user === "My"){
    user = ''
  }
  else {
    //remove last 2 characters (`s)
    user = user+'/';
  }
  const [selectedTimeframeB, setselectedTimeframeB] = useState('7d'); // Default to 1 day
  const [avgPerfect, setAvgPerfect] = useState('0 minutes'); 
  const [avgGood, setAvgGood] = useState('0 minutes'); // Default to
  const [avgBad, setAvgBad] = useState('0 minutes');
  const [avgAngle, setAvgAngle] = useState('0 degrees');
  const [longestPerfectStreak, setLongestPerfectStreak] = useState('0 minutes');
  const [corrections, setCorrections] = useState('0'); 
  const [dateRange, setDateRange] = useState('24/9 - 30/9');
  const [chartData, setData] = useState({
        labels: [],
        datasets: [
          {
            label: 'Perfect',
            backgroundColor: '#78D06A',
            borderWidth: 1,
            hoverBackgroundColor: '#A9FF9B',
            hoverBorderColor: '#A9FF9B',
            cornerRadius: 4,
            data: []
          },
          {
            label: 'Good',
            backgroundColor: '#F4B54C',
            borderWidth: 1,
            hoverBackgroundColor: '#FFC769',
            hoverBorderColor: '#FFC769',
            cornerRadius: 4,
            data: []
          },
          {
            label: 'Poor',
            backgroundColor: '#EE5757',
            borderWidth: 1,
            hoverBackgroundColor: '#FF7474',
            hoverBorderColor: '#FF7474',
            cornerRadius: 4,
            data: []
          }
        ]
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
      console.log(selectedTimeframeB)
      //convert startDate to UnixTimestamp
      startDate = startDate.getTime()

      const correctionRef = query(ref(database, user+'Correction'),startAt(startDate.toString()));
      //count number of data in correctionRef

      get(correctionRef).then((snapshot) => {
        // Check if the snapshot exists and has children
        if (snapshot.exists() && snapshot.hasChildren()) {
          // Count the number of children (data entries)
          const numberOfEntries = snapshot.numChildren();
          setCorrections(numberOfEntries);}
        });

      
      const postureRef = query(ref(database, user+'Posture'), orderByKey(), 
      startAt(startDate.toString()));
      onValue(postureRef, (snapshot) => {
        const data = snapshot.val();
  
        // if (data) {
        processPostureData(data, startDate);
        // }
      });
      
    }, [selectedTimeframeB]);
    // Function to get unique labels for legend


    const processPostureData = (data,sdate) => {
      let counts = {};

    let totalBadTime = 0;
    let totalGoodTime = 0;
    let totalPerfectTime = 0;
    let angles = [];
    let longestPerfect = 0;
    let uprightStreak = 0 
    let uprightTotal = 0
    let longestStreak = 0;
   

    console.log(counts)
  
    let labels = [];
    if (selectedTimeframeB === '1d') {
      for (let i = 0; i < 24; i++) {
        let hour = i.toString().padStart(2, '0') + ':00'; // Format: "HH:00"
        counts[hour] = { bad: 0, good: 0, perfect: 0 };
        
        labels.push(hour);
        console.log(counts)
    }

   
    if (data != null) {
    Object.entries(data).forEach(([timestamp, { PostureQuality, TrunkInclination }]) => {
        const date = new Date(parseInt(timestamp));
        const hourKey = date.getHours().toString().padStart(2, '0') + ':00';


        if (counts[hourKey]) {
            counts[hourKey][PostureQuality] += 1;
            angles.push(TrunkInclination);
        }
        if (PostureQuality === "bad") {
          totalBadTime += 1;
          if (uprightStreak > longestStreak){
            longestStreak = uprightStreak
          }
          uprightStreak = 0
        } else if (PostureQuality === "good"){
          totalGoodTime += 1;
          uprightTotal += 1
          uprightStreak += 1

        
        } else {
          totalPerfectTime += 1;
          uprightTotal += 1
          uprightStreak += 1
          
        }
    });
    console.log(counts)
  }
} else {
  console.log('else')
  const now = new Date();
  const startDate = new Date(sdate); // selectedStartDate should be the Unix Timestamp of your start date
  // const endDate = new Date(Math.max(...Object.keys(data).map(ts => parseInt(ts ))));
  const endDate = new Date(now.setDate(now.getDate() ))
  

  for (let d = new Date(startDate); d <= endDate ; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    counts[dateKey] = { bad: 0, good: 0, perfect: 0 };
  }
  labels = Object.keys(counts).sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'))); 


  // Process the actual data
  if (data!= null){
  Object.entries(data).forEach(([timestamp, { PostureQuality, TrunkInclination }]) => {
    const date = new Date(parseInt(timestamp)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    // console.log(counts)
    if (counts[date]) { // This check is technically redundant now but left for clarity
      counts[date][PostureQuality] += 1;
      angles.push(TrunkInclination);

      if (PostureQuality === "bad") {
        totalBadTime += 1;
      } else if (PostureQuality === "good"){
        totalGoodTime += 1;
      } else {
        totalPerfectTime += 1;
      }
    }
  });}
  
 }

const badPostureData = labels.map(label => counts[label].bad);
const goodPostureData = labels.map(label => counts[label].good);
const perfectPostureData = labels.map(label => counts[label].perfect);
longestPerfect = Math.max(...perfectPostureData)

const updatePostureScoreInFirebase = (data) => {
  const postureScoreRef = ref(database, user+'Params/PostureScore');
  set(postureScoreRef, data).catch((error) => {
    console.error("Error updating height in Firebase", error);});
};

const updateUprightTimeInFirebase = (data) => {
  const UprightTimeRef = ref(database, user+'Params/UprightTime');
  set(UprightTimeRef, data).catch((error) => {
    console.error("Error updating upright time in Firebase", error);});
};

const updateUprightStreakInFirebase = (data) => {
  const UprightStreakRef = ref(database, user+'Params/UprightStreak');
  set(UprightStreakRef, data).catch((error) => {
    console.error("Error updating upright streak in Firebase", error);});
};

// sum angles array divide by the array length
console.log(totalPerfectTime)
if (angles.length > 0){
setAvgAngle((angles.reduce((accumulator, currentAngle) => accumulator + currentAngle, 0)/angles.length).toFixed(1));
updatePostureScoreInFirebase(calculateContinuousPostureScore(avgAngle).toFixed(0))
updateUprightTimeInFirebase(uprightTotal)
updateUprightStreakInFirebase(longestStreak)

} else {setAvgAngle(0)}
let denom = 1;
if (selectedTimeframeB === '1d') {
  denom = 1;
}else{
  denom = labels.length;
}
setAvgPerfect(formatTime((totalPerfectTime/denom).toFixed(1)));
setAvgBad(formatTime((totalBadTime/denom).toFixed(1)))
setAvgGood(formatTime((totalGoodTime/denom).toFixed(1)))
setLongestPerfectStreak(formatTime(longestPerfect));

setData({
  labels,
  datasets: [
    { ...chartData.datasets[0], data: perfectPostureData },
    { ...chartData.datasets[1], data: goodPostureData },
    { ...chartData.datasets[2], data: badPostureData  },
  ],
});
setDateRange(`${labels[0]} - ${labels[labels.length - 1]}`);
};
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
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hours ${mins} minutes`;
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
    function calculateContinuousPostureScore(trunkInclination) {
      const idealRangeStart = -5;
      const idealRangeEnd = 20;
    
      // Calculate the distance from the ideal range
      const distanceToIdeal = Math.min(
        Math.abs(trunkInclination - idealRangeStart),
        Math.abs(trunkInclination - idealRangeEnd)
      );
    
      // Calculate a continuous score based on the distance to the ideal range
      const maxScore = 100;
      const minScore = 50;
      const maxDistance = Math.max(idealRangeEnd - idealRangeStart, 0);
    
      const score = Math.max(
        maxScore - (distanceToIdeal / maxDistance) * (maxScore - minScore),
        minScore
      );
    
      return score;
    }

    return (
      <>
        <div className="time-interval-bar">
          <div className="group-33">
            <div className="overlap-group-4">
            <a  className={`text-wrapper-27 ${selectedTimeframeB === '1d' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('1d')}>1d</a>
            <a  className={`text-wrapper-29 ${selectedTimeframeB === '7d' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('7d')}>7d</a>
            <a  className={`text-wrapper-28 ${selectedTimeframeB === '2w' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('2w')}>2w</a>
            <a  className={`text-wrapper-23 ${selectedTimeframeB === '1m' ? 'active' : ''}`} onClick={() => setselectedTimeframeB('1m')}>1m</a>
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
      <CustomLegend chartData={chartData} />
    </div>
    <div className="day-breakdown">
                <PostureAngle className="posture-angle-instance" angle={avgAngle} user={user}/>
              </div>
      <div className="desk-time-summary">
                <div className="average-DT">
                  <div className="text-wrapper-38">Posture Score</div>
                  <div className="overlap-group-7">
                    <div className="text-wrapper-39">{calculateContinuousPostureScore(avgAngle).toFixed(0)}</div>
                    <div className="text-wrapper-40">/100</div>
                  </div>
                </div>
              </div>
              <div className="group-wrapper">
                <div className="group-37">
                  <div className="average-SD-2">
                    <div className="overlap-group-8">
                      <div className="text-wrapper-41">Avg Good Posture</div>
                      <div className="text-wrapper-42">{avgGood}</div>
                    </div>
                  </div>
                  <div className="closest">
                    <div className="overlap-group-8">
                      <div className="text-wrapper-43">{avgAngle} degrees</div>
                      <div className="text-wrapper-41">Avg Posture Angle</div>
                    </div>
                  </div>
                  <div className="closest-2">
                    <div className="overlap-8">
                      <div className="text-wrapper-44">{corrections} times</div>
                      <div className="text-wrapper-45">Corrections</div>
                    </div>
                  </div>
                  <div className="closest-3">
                    <div className="overlap-9">
                      <div className="text-wrapper-46">{avgBad}</div>
                      <div className="text-wrapper-47">Avg Poor Posture</div>
                    </div>
                  </div>
                  <div className="closest-5">
                    <div className="overlap-10">
                      <div className="text-wrapper-50">{avgPerfect}</div>
                      <div className="text-wrapper-49">Avg Perfect Posture</div>
                    </div>
                  </div>
                  <div className="closest-4">
                    <div className="overlap-10">
                      <div className="text-wrapper-48">{longestPerfectStreak}</div>
                      <div className="text-wrapper-49">Longest Perfect Streak</div>
                    </div>
                  </div>
                </div>
              </div>
    </>  
  )   
}