import React from "react";
import { BotBar_Home } from "../../components/BotBar_Home";
import "./style.css";
import { Link } from 'react-router-dom';
import { PostureAngle } from "../../components/PostureAngle";
import { BarChartPosture } from "../../components/BarChartPosture";

function Posture() {
  return (
    <div className="posture">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <div className="text-wrapper">Intellidesk</div>
              <img className="line" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-1.svg" />
            </div>
          </div>
          <BotBar_Home className="bot-bar-home-instance-node" />
          <div className="bot-bar-home">
            <div className="div">
              <div className="group">
                <div className="text-wrapper-2">More</div>
                <div className="group-2">
                  <div className="ellipse-wrapper">
                    <div className="ellipse" />
                  </div>
                  <div className="div-wrapper">
                    <div className="ellipse" />
                  </div>
                  <div className="group-3">
                    <div className="ellipse" />
                  </div>
                </div>
              </div>
              <div className="text-wrapper-3">My Timers</div>
              <img className="asset" alt="Asset" src="https://c.animaapp.com/QHWYwOlz/img/asset-7-720x-1@2x.png" />
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
                  <div className="rectangle-3" />
                  <img className="img" alt="Group" src="https://c.animaapp.com/QHWYwOlz/img/group-29-1@2x.png" />
                </div>
              </div>
              <div className="group-7">
                <div className="text-wrapper-6">My Goals</div>
              </div>
              <img className="asset-x" alt="Asset" src="https://c.animaapp.com/QHWYwOlz/img/asset-15-720x-1@2x.png" />
            </div>
          </div>
          <div className="frame">
            <div className="overlap-3">
              <div className="group-8">
                <div className="overlap-group-3">
                  <div className="rectangle-4" />
                  <div className="group-9" />
                </div>
              </div>
              <div className="navbar">
                <div className="text-wrapper-7">24/9</div>
                <div className="text-wrapper-8">25/9</div>
                <div className="text-wrapper-9">26/9</div>
                <div className="text-wrapper-10">27/9</div>
                <div className="text-wrapper-11">28/9</div>
                <div className="text-wrapper-12">29/9</div>
                <div className="text-wrapper-13">30/9</div>
              </div>
              <div className="grid-lines">
                <img className="line-2" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-3" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-4" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-5" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-6" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-7" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
                <img className="line-8" alt="Line" src="https://c.animaapp.com/QHWYwOlz/img/line-2.svg" />
              </div>
              {/* <BarChartPosture className="bar-chart-posture" /> */}
              <div className="rectangle-wrapper">
                <div className="rectangle-5" />
              </div>
              <div className="group-10">
                <div className="rectangle-6" />
              </div>
              <div className="group-11">
                <div className="rectangle-7" />
              </div>
              <div className="group-12">
                <div className="rectangle-8" />
              </div>
              <div className="group-13">
                <div className="rectangle-9" />
              </div>
              <div className="group-14">
                <div className="rectangle-10" />
              </div>
              <div className="group-15">
                <div className="rectangle-11" />
              </div>
              <div className="group-16">
                <div className="rectangle-12" />
              </div>
              <div className="group-17">
                <div className="rectangle-13" />
              </div>
              <div className="group-18">
                <div className="rectangle-8" />
              </div>
              <div className="group-19">
                <div className="rectangle-14" />
              </div>
              <div className="group-20">
                <div className="rectangle-7" />
              </div>
              <div className="group-21">
                <div className="rectangle-15" />
              </div>
              <div className="group-22">
                <div className="rectangle-16" />
              </div>
              <div className="group-23">
                <div className="rectangle-17" />
              </div>
              <div className="group-24">
                <div className="rectangle-18" />
              </div>
              <div className="group-25">
                <div className="rectangle-16" />
              </div>
              <div className="group-26">
                <div className="rectangle-17" />
              </div>
              <div className="group-27">
                <div className="rectangle-8" />
              </div>
              <div className="group-28">
                <div className="rectangle-14" />
              </div>
              <div className="group-29">
                <div className="rectangle-7" />
              </div>
              <div className="text-wrapper-14">Posture</div>
              <div className="text-wrapper-15">Posture angle</div>
              <div className="date-line">
                <div className="group-30">
                  <div className="text-wrapper-16">0</div>
                  <div className="text-wrapper-17">50</div>
                  <div className="text-wrapper-18">100</div>
                  <div className="text-wrapper-19">150</div>
                </div>
                <div className="group-31">
                  <div className="ellipse-2" />
                  <div className="ellipse-3" />
                  <div className="ellipse-4" />
                  <div className="ellipse-5" />
                  <div className="ellipse-6" />
                  <div className="ellipse-7" />
                  <div className="ellipse-8" />
                </div>
              </div>
              <div className="group-32">
                <div className="overlap-group-4">
                  <div className="text-wrapper-20">24</div>
                  <div className="text-wrapper-21">28</div>
                  <div className="overlap-group-5">
                    <div className="text-wrapper-22">25</div>
                  </div>
                  <div className="text-wrapper-23">30</div>
                  <div className="text-wrapper-24">26</div>
                  <div className="text-wrapper-25">27</div>
                  <div className="text-wrapper-26">29</div>
                </div>
              </div>
              <Link to="/">
              <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              <div className="time-interval-bar">
                <div className="group-33">
                  <div className="overlap-group-4">
                    <div className="text-wrapper-27">1d</div>
                    <div className="text-wrapper-28">4w</div>
                    <div className="text-wrapper-29">7d</div>
                    <div className="text-wrapper-23">1y</div>
                  </div>
                </div>
                <div className="text-wrapper-30">24/9 - 30/9</div>
              </div>
              </Link>
              <div className="day-breakdown">
                <PostureAngle className="posture-angle-instance" angle={87}/>
                {/* <div className="overlap-4">
                  <div className="calories-ring">
                    <div className="overlap-5">
                      <img
                        className="ellipse-9"
                        alt="Ellipse"
                        src="https://c.animaapp.com/QHWYwOlz/img/ellipse-16@2x.png"
                      />
                      <div className="ellipse-10" />
                      <div className="group-34">
                        <div className="overlap-group-6">
                          <div className="text-wrapper-31">87</div>
                          <div className="text-wrapper-32">degrees</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="average-SD">
                    <div className="overlap-6">
                      <div className="text-wrapper-33">Calibrate</div>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="edit">
                <div className="overlap-7">
                  <div className="text-wrapper-34">Edit</div>
                </div>
              </div>
              {/* <div className="group-35">
                <div className="rectangle-19" />
                <img className="polygon" alt="Polygon" src="https://c.animaapp.com/QHWYwOlz/img/polygon-4.svg" />
              </div> */}
              <div className="group-36">
                <div className="ellipse-11" />
                <div className="ellipse-12" />
                <div className="ellipse-13" />
                <div className="text-wrapper-35">Perfect</div>
                <div className="text-wrapper-36">Good</div>
                <div className="text-wrapper-37">Poor</div>
              </div>
              <div className="desk-time-summary">
                <div className="average-DT">
                  <div className="text-wrapper-38">Posture Score</div>
                  <div className="overlap-group-7">
                    <div className="text-wrapper-39">93</div>
                    <div className="text-wrapper-40">/100</div>
                  </div>
                </div>
              </div>
              <div className="group-wrapper">
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
                  <div className="closest-4">
                    <div className="overlap-10">
                      <div className="text-wrapper-48">56mins</div>
                      <div className="text-wrapper-49">Longest Perfect Streak</div>
                    </div>
                  </div>
                  <div className="closest-5">
                    <div className="overlap-10">
                      <div className="text-wrapper-50">2 hours</div>
                      <div className="text-wrapper-49">Avg Perfect Posture</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <BotBar_Home className="bot-bar-home-instance" /> */}
        </div>
      </div>
    </div>
  );
};

export default Posture;
