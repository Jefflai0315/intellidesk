import React, { useState } from 'react';

const PostureCounter = ({ data }) => {
  // State to store the counts
  const [counts, setCounts] = useState({ perfect: 0, good: 0, bad: 0 });

  // State for start and end timestamps
  // const [startTimestamp, setStartTimestamp] = useState('1705393416543');
  // const [endTimestamp, setEndTimestamp] = useState('1705475091717');

  const countPostures = (startTimestamp, endTimestamp) => {
    let newCounts = { perfect: 0, good: 0, bad: 0 };
    // Filter data by timestamp range and count postures
    Object.entries(data.Posture).forEach(([timestamp, value]) => {
      console.log(timestamp, value);
      if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
        console.log('inside' + timestamp  )
        if (value.PostureQuality === 'perfect') newCounts.perfect += 1;
        else if (value.PostureQuality === 'good') newCounts.good += 1;
        else if (value.PostureQuality === 'bad') newCounts.bad += 1;
      }
    });

    setCounts(newCounts);
  };

  return (
    
    <div>
      <button onClick={() => countPostures('1705393416543 ', '1705475091717')}>
        Count Postures
      </button>
      <div>Perfect: {counts.perfect}</div>
      <div>Good: {counts.good}</div>
      <div>Bad: {counts.bad}</div>
    </div>
  );
};

export default PostureCounter;
