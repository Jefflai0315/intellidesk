import React from 'react';
import GaugeComponent from 'react-gauge-component'


export const PostureGauge = ({ score }) => {
// function PostureGauge({ score }) {
  // Assuming the score is between 0 and 100
  // const percentage = score / 100;
  
      return(
        <GaugeComponent
          type="semicircle"
          minValue= "0"
          maxValue= "100"
          value= {score}
          pointer={{type: "blob", animationDelay: 0, color: "#FFFFFF" }}
          arc={{
            colorArray: ["#EE5757", "#F4B54C", "#78D06A"],
            padding: 0.02,
            subArcs:
              [
                { limit: 50 },
                { limit: 75 },
                { limit: 100 },
              ]
          }}
        />
      )
    };
