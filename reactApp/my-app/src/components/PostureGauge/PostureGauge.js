import React from 'react';
import GaugeChart from 'react-gauge-chart'
import * as d3 from 'd3'

export const PostureGauge = ({ score }) => {
// function PostureGauge({ score }) {
  // Assuming the score is between 0 and 100
  const percentage = score / 100;

  return (
    <GaugeChart id="posture-gauge"
      nrOfLevels={2} // Number of segments
      colors={["#78D06A", "#3B3B3B"]} // Array of colors for the segments
      arcWidth={0.1} // Thickness of the gauge segments
      percent={percentage} // Value as a decimal
      textColor={"#fff"} // Text color
      needleColor={"#898989"} // Color of the needle
      needleBaseColor={"#898989"} // Color of the base of the needle
    />
  );
};

// export default PostureGauge;