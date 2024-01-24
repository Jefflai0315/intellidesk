import React from 'react';
import GaugeChart from 'react-gauge-chart'
import * as d3 from 'd3'

export const PostureAngle = ({ angle }) => {
// function PostureGauge({ score }) {
  // Assuming the score is between 0 and 100
  const percentage = angle / 180;

  return (
    <GaugeChart id="posture-gauge"
      nrOfLevels={3} // Number of segments
      colors={["#EE5757", "#78D06A", "F4B54C"]} // Array of colors for the segments
      arcWidth={0.1} // Thickness of the gauge segments
      percent={percentage} // Value as a decimal
      textColor={"#fff"} // Text color
      needleColor={"#898989"} // Color of the needle
      needleBaseColor={"#898989"} // Color of the base of the needle
    />
  );
};