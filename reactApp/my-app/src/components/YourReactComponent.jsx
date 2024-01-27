// import React, { useState, useEffect } from 'react';
// import { fetchDataFromFirebase } from '../firebaseService'; // Adjust the path as needed

// const YourReactComponent = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetchDataFromFirebase().then(fetchedData => {
//       setData(fetchedData);
//     });
//   }, []);

//   // Render your component with the fetched data
//   return (
//     <div>
//       {/* Render your data here */}
//     </div>
//   );
// };

// export default YourReactComponent;

import React, { useEffect, useState } from 'react';
import database from '../firebase'; // Adjust the path as needed
import { ref, onValue, get, child } from 'firebase/database';
import PostureCounter from '../PostureCounter';

const YourReactComponent = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const dataRef = ref(database);
    get(child(dataRef, `Posture/`)).then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val());
    } else {
        console.log("No data available");
    }
    }).catch((error) => {
    console.error(error);
    });
    // console.log(dataRef);
    
    // Subscribe to the database path
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const newData = snapshot.val();
      setData(newData);
    });
    
    // Unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Render your data here */}
      <PostureCounter data={data} />
    </div>
  );
};

export default YourReactComponent;

