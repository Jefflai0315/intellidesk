import React from 'react';
import { Link } from 'react-router-dom';

function Posture() {
  return (
    <div>
      <h1>Posture Page</h1>
      <p>This is the posture page.</p>
      <Link to="/">
        <button>Go to Home</button>
      </Link>
    </div>
  );
}

export default Posture;
