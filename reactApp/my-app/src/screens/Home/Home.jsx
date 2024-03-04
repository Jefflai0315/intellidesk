import React, { useEffect, useState } from 'react';
import { BarIcon } from "../../components/BarIcon";
import { BotBar_Home } from "../../components/BotBar_Home";
import { PostureGauge } from "../../components/PostureGauge";
import "./style.css";
import { Link } from 'react-router-dom';
import logoImage from '../../imgs/logo@720x.png';
import profileIcon from '../../imgs/Asset 41@720x.png';
import profileGreen from '../../imgs/Asset 42@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import tickIcon from '../../imgs/Asset 51@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';
import { LineChart_DeskTime } from "../../components/LineChartDeskTime";
import { BarChartSD_Home } from "../../components/BarChartSD_Home";
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

function Home() {
  const [user, setUser] = useState('My')
  const [caloriesBurned, setCaloriesBurned] = useState('0')
  const [caloriesBurnedGoal, setCaloriesBurnedGoal] = useState('1000')
  const [uprightStreak, setUprightStreak] = useState('0')
  const [uprightTime, setUprightTime] = useState(0)
  const [postureScore, setPostureScore] = useState(0)
  const [lastFetched, setLastFetched] = useState(Date.now());
  const [avgAngle, setAvgAngle] = useState('0 degrees');


  useEffect(() => {
    const ESRef = query(ref(database, 'Controls/User'));
  onValue(ESRef, (snapshot) => {
    const data = snapshot.val();
    setUser(data + "'s");

  });

  // const UprightRef = query(ref(database, user.slice(0,-2)+'/Params'));
  // onValue(UprightRef, (snapshot) => {
  //   const UprightStreak = snapshot.val()['UprightStreak'];
  //   const UprightTime = snapshot.val()['UprightTime'];
  //   setUprightStreak(UprightStreak);
  //   setUprightTime(UprightTime);
  // });
  const now = new Date();
  const startDate = new Date(now.setDate(now.getDate()-1))
  
  const postureRef = query(ref(database, user.slice(0,-2)+'/Posture'), orderByKey(), 
      startAt(startDate.getTime().toString()));
      onValue(postureRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
  
        // if (data) {
        processPostureData(data, startDate);
        // }
      });

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
     
  
      // console.log(counts)
    
      let labels = [];
        for (let i = 0; i < 24; i++) {
          let hour = i.toString().padStart(2, '0') + ':00'; // Format: "HH:00"
          counts[hour] = { bad: 0, good: 0, perfect: 0 };
          
          labels.push(hour);
          // console.log(counts)
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
      
    }
    setUprightStreak(longestStreak);
  setUprightTime(uprightTotal);
  console.log(longestStreak, uprightStreak)
  if (angles.length >0){
  setAvgAngle((angles.reduce((accumulator, currentAngle) => accumulator + currentAngle, 0)/(angles.length+ 0.0001)).toFixed(1));
  setPostureScore(calculateContinuousPostureScore(avgAngle).toFixed(0))

  }else{
    setPostureScore(0)
  }
  } 

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

  

  const CBRef = query(ref(database, user.slice(0,-2)+'/Params'));
  onValue(CBRef, (snapshot) => {
    const CBdata = snapshot.val()['CaloriesBurned'];
    const CBGdata = snapshot.val()['CaloriesBurnedGoal'];

    // if (data) {
    
    setCaloriesBurned(CBdata);
    setCaloriesBurnedGoal(CBGdata);
    console.log('CaloriesBurned' + ' ' + caloriesBurned)
    console.log('CaloriesBurnedGoal' + ' ' + caloriesBurnedGoal)
    // }
    setLastFetched(CBdata); // this line is to rerender the components only
  });});

  return (
    <div className="home">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <img src={logoImage} alt="Intellidesk Logo" className="logo-wrapper" />
              <div className="line" style={{ height: '2px', backgroundColor: '#A9FF9B', width: '100%' }}></div> {/* Replace the img tag with this div */}
            </div>
          </div>
          <div className="home-pg">
            <div className="overlap-2">
              <div className="rectangle-5" />
              <div className="text-wrapper-2">{user} Day </div>
              <div className="text-wrapper-3">Screen Distance</div>
              <div className="text-wrapper-4">Daily Activity</div>
              <div className="text-wrapper-5">Posture</div>
              <BarChartSD_Home key={lastFetched} className="bar-chart-sd-home-instance-node" user = {user} />
              <div className="overlap-group-wrapper">
                <div className="overlap-4">
                  <div className="text-wrapper-9">{caloriesBurned} cal</div>
                  <div className="text-wrapper-10">Calories burnt</div>
                </div>
              </div>
              <div className="text-wrapper-12">Desk Time</div>
              <div className="text-wrapper-13">Today</div>
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '380px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '616px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '967px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '1210px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <Link to="/DeskTime">
              <BarIcon className="bar-icon-instance" user = {user}/>
              </Link>
              <Link to="/ScreenDistance">
              <div className="bar-icon-2">
                <div className="rectangle-9" />
                <div className="rectangle-10" />
                <div className="rectangle-11" />
                <div className="rectangle-12" />
              </div>
              </Link>
              <Link to="/DailyActivity">
              <div className="bar-icon-3">
                <div className="rectangle-9" />
                <div className="rectangle-10" />
                <div className="rectangle-11" />
                <div className="rectangle-12" />
              </div>
              </Link>
              <div className="desk-time-summary">
                <LineChart_DeskTime key={lastFetched} redraw={true} className="line-chart-desk-time-instance-node" user = {user}/>
              </div>
              <div className="group-4">
                <div className="overlap-8">
                  <div className="div-wrapper">
                    <div className="ellipse-wrapper">
                      <div className="ellipse-10" />
                    </div>
                  </div>
                  <div className="group-wrapper">
                    <div className="group-5">
                      <div className="text-wrapper-29">{(caloriesBurned/caloriesBurnedGoal* 100).toFixed(0) }</div>
                      <div className="text-wrapper-30">/100</div>
                    </div>
                  </div>
                </div>
                <div className="almost-there-keep-it">Almost there&nbsp;&nbsp;Keep it up!</div>
              </div>
              <div className="group-6">
                <div className="overlap-9">
                  <div className="group-7">
                    <PostureGauge key={lastFetched} className="posture-gauge-instance" user={user} postureScore={postureScore}/>
                  </div>
                </div>
              </div>
              <div className="group-9">
                <div className="upright-streak">
                  <div className="group-10">
                    <div className="text-wrapper-33">{uprightStreak}</div>
                    <div className="text-wrapper-34">mins</div>
                  </div>
                </div>
                <div className="text-wrapper-35">Upright streak</div>
              </div>
              <div className="group-11">
                <div className="upright-streak">
                  <div className="group-10">
                    <div className="text-wrapper-36">{uprightTime}</div>
                    <div className="text-wrapper-34">mins</div>
                  </div>
                </div>
                <div className="text-wrapper-37">Total Upright Time</div>
              </div>
              {/* <div className="text-wrapper-38">Timers</div>
              <div className="hydration">
                <div className="text-wrapper-39">Hydration</div>
                <img className="group-12" alt="Group" src="https://c.animaapp.com/VczO8maf/img/group-31@2x.png" />
                <div  className="text-wrapper-39" style={{height:'100px'}}> </div>
              </div>
              <div className="pomodoro">
                <div className="text-wrapper-40">Pomodoro</div>
                <div className="group-13">
                  <div className="rectangle-13" />
                  <div className="rectangle-14" />
                  <div className="rectangle-15" />
                  <div className="rectangle-16" />
                  <div className="rectangle-17" />
                  <div className="rectangle-18" />
                  <div className="rectangle-19" />
                </div>
              </div> */}
              {/* <BarIcon className="design-component-instance-node" />
              <BarIcon className="bar-icon-4" /> */}
              <div className="frame">
                <Link to="/Posture">
                <div className="bar-icon-5">
                  <div className="rectangle-9" />
                  <div className="rectangle-10" />
                  <div className="rectangle-11" />
                  <div className="rectangle-12" />
                </div>
                </Link>
              </div>
            </div>
          </div>
          <BotBar_Home className="bot-bar-home-instance-node" />
          <div className="bot-bar-home">
            <div className="bot-bar-div">
              <div className="more-group">
                <div className="more-text-wrapper-2">More</div>
                <img src={moreIcon} alt="More Icon" className="more-icon-wrapper" />
              </div>
              <Link to="/MyProfile">
                <div className="timer-text-wrapper-3">My Profile</div>
                <img src={profileIcon} alt="Timer Icon" className="profile-icon-wrapper" />
              </Link>
              <div className="bot-bar-overlap-group-wrapper">
                <div className="bot-bar-overlap-2">
                  <div className="day-text-wrapper-4">My Day</div>
                  <div className="day-group-4">
                    <img src={tickIcon} alt="Tick Icon" className="tick-icon-wrapper" />
                  </div>
                </div>
              </div>
              <div className="table-group-5">
                <div className="table-text-wrapper-5">My Table</div>
                <img src={tableIcon} alt="Table Icon" className="table-icon-wrapper" />
              </div>
              <div className="goal-group-7">
                <div className="goal-text-wrapper-6">My Goals</div>
              </div>
              <img src={goalsIcon} alt="Goals Icon" className="goals-icon-wrapper" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;