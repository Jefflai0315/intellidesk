import React from "react";
import { BarIcon } from "../../components/BarIcon";
import { BotBar_Home } from "../../components/BotBar_Home";
import { PostureGauge } from "../../components/PostureGauge";
import "./style.css";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <div className="text-wrapper">Intellidesk</div>
              <img className="line" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-1.svg" />
            </div>
          </div>
          <div className="home-pg">
            <div className="overlap-2">
              {/* <div className="rectangle-4" /> */}
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
              <img className="divider" alt="Divider" src="https://c.animaapp.com/VczO8maf/img/divider-3.svg" />
              <img className="img" alt="Divider" src="https://c.animaapp.com/VczO8maf/img/divider-3.svg" />
              <img className="divider-2" alt="Divider" src="https://c.animaapp.com/VczO8maf/img/divider-1@2x.png" />
              <img className="divider-3" alt="Divider" src="https://c.animaapp.com/VczO8maf/img/divider-1@2x.png" />
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
              <div className="bar-icon-2">
                <div className="rectangle-9" />
                <div className="rectangle-10" />
                <div className="rectangle-11" />
                <div className="rectangle-12" />
              </div>
              </Link>
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
                <div className="stats">
                  <div className="overlap-5">
                    <div className="text-wrapper-17">hrs</div>
                    <div className="text-wrapper-18">20</div>
                  </div>
                  <div className="overlap-6">
                    <div className="text-wrapper-19">hrs</div>
                    <div className="text-wrapper-20">35</div>
                  </div>
                </div>
                <div className="legend">
                  <div className="ellipse" />
                  <div className="ellipse-2" />
                  <div className="text-wrapper-21">Standing</div>
                  <div className="text-wrapper-22">Sitting</div>
                </div>
                <div className="divider-4">
                  <img className="line-8" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-12.svg" />
                  <img className="line-9" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-13.svg" />
                </div>
                <div className="date-line">
                  <div className="text-wrapper-23">24/9</div>
                  <div className="text-wrapper-24">30/9</div>
                  <div className="group">
                    <div className="ellipse-3" />
                    <div className="ellipse-4" />
                    <div className="ellipse-5" />
                    <div className="ellipse-6" />
                    <div className="ellipse-7" />
                    <div className="ellipse-8" />
                    <div className="ellipse-9" />
                  </div>
                </div>
                <div className="line-chart">
                  <img className="line-10" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-8.svg" />
                  <div className="overlap-7">
                    <img className="line-11" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-9.svg" />
                    <img className="line-12" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-10.svg" />
                    <img className="group-2" alt="Group" src="https://c.animaapp.com/VczO8maf/img/group-1@2x.png" />
                    <img className="group-3" alt="Group" src="https://c.animaapp.com/VczO8maf/img/group-2@2x.png" />
                  </div>
                  <img className="line-13" alt="Line" src="https://c.animaapp.com/VczO8maf/img/line-11.svg" />
                </div>
              </div>
              <div className="navbar-wrapper">
                <div className="navbar">
                  <div className="text-wrapper-25">1d</div>
                  <div className="text-wrapper-26">4w</div>
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
          <BotBar_Home className="bot-bar-home-instance" />
        </div>
      </div>
    </div>
  );
};

export default Home;