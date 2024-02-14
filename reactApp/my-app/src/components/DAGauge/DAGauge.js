import React, {useState,useEffect} from 'react';
import GaugeComponent from 'react-gauge-component'
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue} from 'firebase/database'


export const DAGauge = ({ score , user}) => {
  if (user === "My"){
    user = ''
  }
  else {
    //remove last 2 characters (`s)
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
  
    // Calculate the distance from the ideal range
    const distanceToIdeal = Math.min(
      Math.abs(trunkInclination - idealRangeStart),
      Math.abs(trunkInclination - idealRangeEnd)
    );
  
    // Calculate a continuous score based on the distance to the ideal range
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
          {score}<span style={{ fontSize: '19px', color: '#D4D4D4' }}>{postureScore}%</span> {/* /100 is smaller */}
      </div>
      {/* Display the text "Score" below the score */}
      <div style={{
        position: 'absolute',
        bottom: '48px', // Adjust the position accordingly
        left: '54%',
        transform: 'translateX(-50%)',
        fontSize: '17px', // Adjust the font size accordingly
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        of goal
      </div>
      <div style={{
        position: 'absolute',
        bottom: '0', // Adjust the position accordingly
        left: '54%',
        transform: 'translateX(-50%)',
        fontSize: '17px', // Adjust the font size accordingly
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        Calories Burnt
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-20px', // Adjust the position accordingly
        left: '64%',
        transform: 'translateX(-50%)',
        fontSize: '15px', // Adjust the font size accordingly
        color: 'white',
        zIndex: 10,
        fontFamily: 'Helvetica',
      }}>
        188 cal 
      </div>
    </div>
  )
};
