import React, {useState,useEffect} from 'react';
import GaugeComponent from 'react-gauge-component'
import database from '../../firebase'; 
import { query, ref, onValue} from 'firebase/database'

export const DAGauge = ({ score , user}) => {
  if (user === "My"){
    user = ''
  }
  else {
    user = user.slice(0, -2) +'/';
  }
  const [postureScore, setPostureScore] = useState('My')

  useEffect(() => {
    const ESRef = query(ref(database, user+'Params/PostureScore'));
  onValue(ESRef, (snapshot) => {
    const data = snapshot.val();
    setPostureScore(data);
  });});
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
  
      return(
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', top: '130px' }}>
          <GaugeComponent
            type="semicircle"
            minValue= "0"
            maxValue= "100"
            value= {postureScore}
            
            pointer={{type: "blob", animationDelay: 0}}
            arc={{
              colorArray: ["#69CBD9", "#3B3B3B"],
              padding: 0.02,
              subArcs:
                [
                  { limit: 50 },
                  { limit: 75 },
                ],
            }}
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
          {score}<span style={{ fontSize: '19px', color: '#D4D4D4' }}>{postureScore}%</span>
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
        of goal
      </div>
      <div style={{
        position: 'absolute',
        bottom: '0', 
        left: '54%',
        transform: 'translateX(-50%)',
        fontSize: '17px', 
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        Calories Burnt
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-20px', 
        left: '64%',
        transform: 'translateX(-50%)',
        fontSize: '15px', 
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        188 cal 
      </div>
    </div>
  )
};
