import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to Our Website</h1>
      <p>This is the home page of our website.</p>
      <Link to="/Posture">
        <button>Go to Posture</button>
      </Link>
    </div>
  );
}

export default Home;