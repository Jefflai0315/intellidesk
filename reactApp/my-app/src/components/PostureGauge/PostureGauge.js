import React, {useState,useEffect} from 'react';
import GaugeComponent from 'react-gauge-component'
import database from '../../firebase'; 
import { query, ref, onValue} from 'firebase/database'


export const PostureGauge = ({ user, postureScore}) => {
  if (user === "My"){
    user = ''
  }
  else {
    user = user.slice(0, -2) +'/';
  }

  function calculateContinuousPostureScore(trunkInclination) {
    const idealRangeStart = -5;
    const idealRangeEnd = 20;
  
    const distanceToIdeal = Math.min(
      Math.abs(trunkInclination - idealRangeStart),
      Math.abs(trunkInclination - idealRangeEnd)
    );
  
    const maxScore = 100;
    const minScore = 50;
    const maxDistance = Math.max(idealRangeEnd - idealRangeStart, 0);
  
    const score = Math.max(
      maxScore - (distanceToIdeal / maxDistance) * (maxScore - minScore),
      minScore
    );
  
    return score;
  }

  console.log(postureScore)
  
      return(
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
          <GaugeComponent
            type="semicircle"
            minValue= "0"
            maxValue= "100"
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
            value= {postureScore}
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
          {postureScore}<span style={{ fontSize: '17px', color: '#D4D4D4' }}>/100</span> 
      </div>
      <div style={{
        position: 'absolute',
        bottom: '48px', 
        left: '54%',
        transform: 'translateX(-50%)',
        fontSize: '17px', 
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        score
      </div>
    </div>
  )
};
