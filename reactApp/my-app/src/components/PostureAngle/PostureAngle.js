import React from 'react';
import GaugeComponent from 'react-gauge-component'

export const PostureAngle = ({ angle }) => {
    const formattedAngle = `${angle}°`;
   

    return(
      <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
        <GaugeComponent
          type="semicircle"
          minValue= "-30"
          maxValue= "50"
          labels={{
          }}
          arc={{
            colorArray: ["#EE5757", "#F4B54C","#78D06A", "#F4B54C", "#EE5757"],
            padding: 0.02,
            subArcs:
              [
                { limit: -10 },
                { limit: 0 },
                { limit: 20 },
                { limit: 30 },
                { limit: 50 },
                
              ],
          }}
          pointer={{type: "blob", animationDelay: 0 }}
          value={angle}
        />
        <div style={{
          position: 'relative',
          bottom: '65px', 
          left: '0',
          margin: '0 auto',
          width: '20%', 
          height: '30px', 
          backgroundColor: '#252525', 
          fontFamily: 'Helvetica',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '65px', 
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '30px', 
          color: 'white',
          fontFamily: 'Helvetica',
        }}>
          {formattedAngle}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '45px', 
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '16px', 
        color: '#D4D4D4',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        Day Average
      </div>  
    </div>
  );
};