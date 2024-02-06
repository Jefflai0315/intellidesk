import React from "react";
import { BotBar_Home } from "../../components/BotBar_Home";
import "./style.css";
import { Link } from 'react-router-dom';
// import { PostureAngle } from "../../components/PostureAngle";
import { BarChartPosture } from "../../components/BarChartPosture";
import logoImage from '../../imgs/logo@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import timerIcon from '../../imgs/Asset 2@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';

function Posture() {
  return (
    <div className="posture">
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
                <div className="group-6">
                  <img src={tableIcon} alt="Table Icon" className="table-icon-wrapper" />
                </div>
              </div>
              <div className="group-7">
                <div className="text-wrapper-6">My Goals</div>
              </div>
              <img src={goalsIcon} alt="Goal Icon" className="goals-icon-wrapper" />
            </div>
          </div>
          <div className="frame">
            <div className="overlap-3">
              <div className="group-8">
                <div className="overlap-group-3">
                  <div className="group-9" />
                </div>
              </div>
              <div className="text-wrapper-14">Posture</div>
              <div className="text-wrapper-15">Posture angle</div>
              <div className="group-32">
                {/* <div className="overlap-group-4"> */}
                  {/* <div className="text-wrapper-20">24</div>
                  <div className="text-wrapper-22">25</div>
                  <div className="text-wrapper-21">28</div>
                  <div className="text-wrapper-23">30</div>
                  <div className="text-wrapper-24">26</div>
                  <div className="text-wrapper-25">27</div>
                  <div className="text-wrapper-26">29</div> */}
                {/* </div> */}
              </div>
              <Link to="/">
              <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              </Link>
              {/* <div className="time-interval-bar">
                <div className="group-33">
                  <div className="overlap-group-4">
                    <div className="text-wrapper-27">1d</div>
                    <div className="text-wrapper-29">7d</div>
                    <div className="text-wrapper-28">1m</div>
                    <div className="text-wrapper-23">1y</div>
                  </div>
                </div>
                <div className="text-wrapper-30">24/9 - 30/9</div>
              </div> */}
            
              {/* <div className="bar-chart-container"> */}
                <BarChartPosture className="bar-chart-posture" />
              {/* </div> */}
              {/* <div className="day-breakdown">
                <PostureAngle className="posture-angle-instance" angle={110}/>
              </div> */}
              {/* <div className="desk-time-summary">
                <div className="average-DT">
                  <div className="text-wrapper-38">Posture Score</div>
                  <div className="overlap-group-7">
                    <div className="text-wrapper-39">93</div>
                    <div className="text-wrapper-40">/100</div>
                  </div>
                </div>
              </div> */}
              {/* <div className="group-wrapper">
                <div className="group-37">
                  <div className="average-SD-2">
                    <div className="overlap-group-8">
                      <div className="text-wrapper-41">Avg Good Posture</div>
                      <div className="text-wrapper-42">3 hours</div>
                    </div>
                  </div>
                  <div className="closest">
                    <div className="overlap-group-8">
                      <div className="text-wrapper-43">76 degrees</div>
                      <div className="text-wrapper-41">Avg Posture Angle</div>
                    </div>
                  </div>
                  <div className="closest-2">
                    <div className="overlap-8">
                      <div className="text-wrapper-44">16 times</div>
                      <div className="text-wrapper-45">Corrections</div>
                    </div>
                  </div>
                  <div className="closest-3">
                    <div className="overlap-9">
                      <div className="text-wrapper-46">1hrs 40mins</div>
                      <div className="text-wrapper-47">Avg Poor Posture</div>
                    </div>
                  </div>
                  <div className="closest-5">
                    <div className="overlap-10">
                      <div className="text-wrapper-50">2 hours</div>
                      <div className="text-wrapper-49">Avg Perfect Posture</div>
                    </div>
                  </div>
                  <div className="closest-4">
                    <div className="overlap-10">
                      <div className="text-wrapper-48">56mins</div>
                      <div className="text-wrapper-49">Longest Perfect Streak</div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posture;
