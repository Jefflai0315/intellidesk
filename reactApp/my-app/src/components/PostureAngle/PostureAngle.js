import React from 'react';
import GaugeComponent from 'react-gauge-component'

export const PostureAngle = ({ angle }) => {
    const formattedAngle = `${angle}°`;

    return(
      <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
        <GaugeComponent
          type="semicircle"
          minValue= "0"
          maxValue= "180"
          labels={{
          }}
          arc={{
            colorArray: ["#EE5757", "#78D06A", "#F4B54C"],
            padding: 0.02,
            subArcs:
              [
                { limit: 90 },
                { limit: 120 },
                { limit: 180 },
              ],
          }}
          pointer={{type: "blob", animationDelay: 0 }}
          value={angle}
        />
        {/* Overlay div to cover the labels */}
        <div style={{
          position: 'relative',
          bottom: '65px', // Adjust this value so it covers the labels
          left: '0',
          margin: '0 auto',
          width: '20%', // Make sure it spans the full width of the gauge
          height: '30px', // Adjust height accordingly to cover the labels
          backgroundColor: '#252525', // Match the gauge's background color
          fontFamily: 'Helvetica',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '65px', // Adjust the position accordingly
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '30px', // Adjust the font size accordingly
          color: 'white',
          fontFamily: 'Helvetica',
        }}>
          {formattedAngle}
      </div>
      {/* Display the text "Score" below the score */}
      <div style={{
        position: 'absolute',
        bottom: '45px', // Adjust the position accordingly
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '16px', // Adjust the font size accordingly
        color: '#D4D4D4',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        Day Average
      </div>  
    </div>
  );
};