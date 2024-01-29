import React from 'react';
import GaugeComponent from 'react-gauge-component'

// export const PostureAngle = ({ angle }) => {
// // function PostureGauge({ score }) {
//   // Assuming the score is between 0 and 100
//   const percentage = angle / 180;

//   return (
//     <GaugeChart id="posture-gauge"
//       nrOfLevels={3} // Number of segments
//       colors={["#EE5757", "#78D06A", "#F4B54C"]} // Array of colors for the segments
//       arcWidth={0.1} // Thickness of the gauge segments
//       percent={percentage} // Value as a decimal
//       textColor={"#fff"} // Text color
//       needleColor={"#898989"} // Color of the needle
//       needleBaseColor={"#898989"} // Color of the base of the needle
//     />
//   );
// };

export const PostureAngle = ({ angle }) => {
  // function PostureGauge({ score }) {
    // Assuming the score is between 0 and 100
    const formattedAngle = `${angle}°`;

    return(
      <GaugeComponent
        type="semicircle"
        minValue= "0"
        maxValue= "180"
        labels={{
          tickLabels: [
            { value: 0, text: "0°" },
            { value: 90, text: "90°" },
            { value: 120, text: "120°" },
            { value: 180, text: "180°" },
          ],
        }}
        arc={{
          colorArray: ["#EE5757", "#78D06A", "#F4B54C"],
          padding: 0.02,
          subArcs:
            [
              { limit: 90 },
              { limit: 120 },
              { limit: 180 },
            ]
        }}
        pointer={{type: "blob", animationDelay: 0 }}
        value={angle}
      >
        <div>{formattedAngle}</div>
      </GaugeComponent>
    );
  };