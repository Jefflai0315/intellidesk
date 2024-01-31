import React from 'react';
import GaugeComponent from 'react-gauge-component'


export const PostureGauge = ({ score }) => {

      return(
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
          <GaugeComponent
            type="semicircle"
            minValue= "0"
            maxValue= "100"
            value= {score}
            pointer={{type: "blob", animationDelay: 0}}
            arc={{
              colorArray: ["#EE5757", "#F4B54C", "#78D06A"],
              padding: 0.02,
              subArcs:
                [
                  { limit: 50 },
                  { limit: 75 },
                  { limit: 100 },
                ],
            }}
        />
        {/* Overlay div to cover the labels */}
        <div style={{
          position: 'relative',
          bottom: '60px', // Adjust this value so it covers the labels
          left: '0',
          margin: '0 auto',
          width: '20%', // Make sure it spans the full width of the gauge
          height: '30px', // Adjust height accordingly to cover the labels
          backgroundColor: '#252525', // Match the gauge's background color
        }} />
        <div style={{
          position: 'absolute',
          bottom: '60px', // Adjust the position accordingly
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '30px', // Adjust the font size accordingly
          color: 'white'
        }}>
          {score}<span style={{ fontSize: '17px' }}>/100</span> {/* /100 is smaller */}
      </div>
    </div>
  )
};
