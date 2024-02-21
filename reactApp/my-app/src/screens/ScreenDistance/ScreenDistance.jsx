import React, { useEffect, useState } from 'react';
import { BotBar_Home } from "../../components/BotBar_Home";
import "./style.css";
import { Link } from 'react-router-dom';
import { BarChartSD } from "../../components/BarChartSD";
import { LineChart_SD } from "../../components/LineChartSD";
import logoImage from '../../imgs/logo@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import timerIcon from '../../imgs/Asset 2@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, orderByKey, startAt } from 'firebase/database'

function ScreenDistance() {
  const [user, setUser] = useState('My')
  const [lastFetched, setLastFetched] = useState();

  useEffect(() => {
    const ESRef = query(ref(database, 'Controls/User'));
    onValue(ESRef, (snapshot) => {
      const data = snapshot.val();
      setUser(data);
      setLastFetched(data) //for data render
    });
  });
  return (
    <div className="screen-distance">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <img src={logoImage} alt="Intellidesk Logo" className="logo-wrapper" />
              <div className="line" style={{ height: '2px', backgroundColor: '#A9FF9B', width: '100%' }}></div> {/* Replace the img tag with this div */}
            </div>
          </div>
          <BotBar_Home className="bot-bar-home-instance-node" />
          <div className="bot-bar-home">
            <div className="div">
              <div className="group">
                <div className="text-wrapper-2">More</div>
                <img src={moreIcon} alt="More Icon" className="more-icon-wrapper" />
              </div>
              <div className="text-wrapper-3">My Timers</div>
              <img src={timerIcon} alt="Timer Icon" className="timer-icon-wrapper" />
              <div className="overlap-group-wrapper">
                <div className="overlap-2">
                  <div className="text-wrapper-4">My Day</div>
                  <div className="group-4">
                    <div className="overlap-group-2">
                      <div className="rectangle" />
                      <div className="rectangle-2" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="group-5">
                <div className="text-wrapper-5">My Table</div>
                <img src={tableIcon} alt="Table Icon" className="table-icon-wrapper" />
              </div>
              <div className="group-7">
                <div className="text-wrapper-6">My Goals</div>
              </div>
              <img src={goalsIcon} alt="Goals Icon" className="goals-icon-wrapper" />
            </div>
          </div>
          <div className="frame">
            <div className="overlap-3">
              <div className="group-8">
                <div className="overlap-group-3">
                  <div className="group-9" />
                </div>
              </div>
              <div className="text-wrapper-14">Screen Distance</div>
              <Link to="/">
                <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              </Link>
            <BarChartSD key={lastFetched} className="bar-chart-screen-distance" user={user} />
            </div>
          </div>
        </div>
      </div>
      {/* <LineChart_SD className="line-chart-screen-distance" user={user} /> */}
    </div>
  );
};

export default ScreenDistance;
