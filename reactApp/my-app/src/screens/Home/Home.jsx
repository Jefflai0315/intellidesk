import React from "react";
import { BarIcon } from "../../components/BarIcon";
import { BotBar_Home } from "../../components/BotBar_Home";
import { PostureGauge } from "../../components/PostureGauge";
import "./style.css";
import { Link } from 'react-router-dom';
import logoImage from '../../imgs/logo@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import timerIcon from '../../imgs/Asset 2@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';
import { LineChart_DeskTime } from "../../components/LineChartDeskTime";

function Home() {

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
              <div className="text-wrapper-2">My Day</div>
              <div className="text-wrapper-3">Screen Distance</div>
              <div className="text-wrapper-4">Daily Activity</div>
              <div className="text-wrapper-5">Posture</div>
              <div className="average-SD">
                <div className="overlap-group-2">
                  <div className="text-wrapper-6">Average</div>
                  <div className="text-wrapper-7">45cm</div>
                </div>
              </div>
              <div className="closest">
                <div className="overlap-3">
                  <div className="text-wrapper-8">30cm</div>
                  <div className="text-wrapper-6">Closest</div>
                </div>
              </div>
              <div className="overlap-group-wrapper">
                <div className="overlap-4">
                  <div className="text-wrapper-9">200 cal</div>
                  <div className="text-wrapper-10">Calories burnt</div>
                </div>
              </div>
              <div className="text-wrapper-11">Too Close</div>
              <div className="too-far">
                Too
                <br />
                Far
              </div>
              <div className="text-wrapper-12">Desk Time</div>
              <div className="text-wrapper-13">Today</div>
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '374px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '616px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '967px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="line" style={{ height: '1px', backgroundColor: '#A9FF9B', width: '80%', left: '0', top: '1210px', opacity: '0.3', margin: '0 auto', position: 'relative' }}></div> {/* Replace the img tag with this div */}
              <div className="grid-lines">
                <img className="line-2" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
                <img className="line-3" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
                <img className="line-4" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
                <img className="line-5" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
                <img className="line-6" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
                <img className="line-7" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-2.svg" />
              </div>
              <div className="bar-chart">
                <div className="rectangle-6" />
                <div className="rectangle-7" />
                <div className="rectangle-8" />
              </div>
              <Link to="/DeskTime">
              <BarIcon className="bar-icon-instance" />
              </Link>
              <div className="bar-icon-2">
                <div className="rectangle-9" />
                <div className="rectangle-10" />
                <div className="rectangle-11" />
                <div className="rectangle-12" />
              </div>
              <div className="bar-icon-3">
                <div className="rectangle-9" />
                <div className="rectangle-10" />
                <div className="rectangle-11" />
                <div className="rectangle-12" />
              </div>
              <div className="desk-time-summary">
                <div className="average-DT">
                  <div className="text-wrapper-14">Average</div>
                  <div className="overlap-group-3">
                    <div className="text-wrapper-15">7.8</div>
                    <div className="text-wrapper-16">hrs/day</div>
                  </div>
                </div>
                <LineChart_DeskTime className="line-chart-desk-time-instance-node" />
              </div>
              <div className="navbar-wrapper">
                <div className="navbar">
                  <div className="text-wrapper-25">1d</div>
                  <div className="text-wrapper-26">1m</div>
                  <div className="text-wrapper-27">7d</div>
                  <div className="text-wrapper-28">1y</div>
                </div>
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
                      <div className="text-wrapper-29">60</div>
                      <div className="text-wrapper-30">/100</div>
                    </div>
                  </div>
                </div>
                <div className="almost-there-keep-it">Almost there&nbsp;&nbsp;Keep it up!</div>
              </div>
              <div className="group-6">
                <div className="overlap-9">
                  <div className="group-7">
                    <PostureGauge className="posture-gauge-instance" score={93}/>
                  </div>
                </div>
              </div>
              <div className="group-9">
                <div className="upright-streak">
                  <div className="group-10">
                    <div className="text-wrapper-33">55</div>
                    <div className="text-wrapper-34">mins</div>
                  </div>
                </div>
                <div className="text-wrapper-35">Upright streak</div>
              </div>
              <div className="group-11">
                <div className="upright-streak">
                  <div className="group-10">
                    <div className="text-wrapper-36">179</div>
                    <div className="text-wrapper-34">mins</div>
                  </div>
                </div>
                <div className="text-wrapper-37">Total Upright Time</div>
              </div>
              <div className="text-wrapper-38">Timers</div>
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
              </div>
              <BarIcon className="design-component-instance-node" />
              <BarIcon className="bar-icon-4" />
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
              <div className="timer-text-wrapper-3">My Timers</div>
              <img src={timerIcon} alt="Timer Icon" className="timer-icon-wrapper" />
              <div className="bot-bar-overlap-group-wrapper">
                <div className="bot-bar-overlap-2">
                  <div className="day-text-wrapper-4">My Day</div>
                  <div className="day-group-4">
                    <div className="tick-overlap-group-2">
                      <div className="tick-rectangle" />
                      <div className="tick-rectangle-2" />
                    </div>
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