import React, { useEffect, useState } from 'react';
import { BotBar_Home } from "../../components/BotBar_Home";
import "./style.css";
import { Link } from 'react-router-dom';
import { DAGauge } from '../../components/DAGauge/DAGauge';
import { BarChartDailyActivity } from "../../components/BarChartDailyActivity";
import logoImage from '../../imgs/logo@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import profileIcon from '../../imgs/Asset 41@720x.png';
import tickIcon from '../../imgs/Asset 51@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';
import database from '../../firebase'; 
import { query, ref, onValue, orderByKey , startAt} from 'firebase/database'

function DailyActivity() {
  const [user, setUser] = useState('My')
  const [lastFetched, setLastFetched] = useState()

  useEffect(() => {
    const ESRef = query(ref(database, 'Controls/User'));
  onValue(ESRef, (snapshot) => {
    const data = snapshot.val();
    setUser(data );
    setLastFetched(data) 
  });});
  return (
    <div className="daily-activity">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <img src={logoImage} alt="Intellidesk Logo" className="logo-wrapper" />
              <div className="line" style={{ height: '2px', backgroundColor: '#A9FF9B', width: '100%' }}></div> 
            </div>
          </div>
          <BotBar_Home className="bot-bar-home-instance-node" />
          <div className="bot-bar-home">
            <div className="div">
              <div className="group">
                <div className="text-wrapper-2">More</div>
                <img src={moreIcon} alt="More Icon" className="more-icon-wrapper" />
              </div>
              <Link to="/MyProfile">
                <div className="text-wrapper-3">My Profile</div>
                <img src={profileIcon} alt="Timer Icon" className="profile-icon-wrapper" />
              </Link>
              <div className="overlap-group-wrapper">
                <Link to="/">
                  <div className="overlap-2">
                    <div className="text-wrapper-4">My Day</div>
                    <div className="group-4">
                      <img src={tickIcon} alt="Tick Icon" className="tick-icon-wrapper" />
                    </div>
                  </div>
                </Link>
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
              <div className="text-wrapper-14">Daily Activity</div>
              <Link to="/">
              <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              </Link>
              <BarChartDailyActivity key={lastFetched} className="bar-chart-daily-activity" user = {user}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivity;