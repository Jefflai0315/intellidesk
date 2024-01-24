import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './screens/Home/Home';
import Posture from './screens/Posture/Posture';
import ScreenTime from './screens/ScreenTime/ScreenTime';
import ScreenTimeCopy from './screens/ScreenTimeCopy/ScreenTimeCopy';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home />}
          />
        <Route
          exact
          path="/Posture"
          element={<Posture />}
          />
        <Route
          exact
          path="/ScreenTime"
          element={<ScreenTime />}
          />
        <Route
          exact
          path="/ScreenTimeCopy"
          element={<ScreenTimeCopy />}
          />
      </Routes>
    </Router>
  );
};

export default App;