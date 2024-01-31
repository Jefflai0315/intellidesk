import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './screens/Home/Home';
import Posture from './screens/Posture/Posture';
// import ScreenTime from './screens/ScreenTime/ScreenTime';
import DeskTime from './screens/DeskTime/DeskTime';


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
        {/* <Route
          exact
          path="/ScreenTime"
          element={<ScreenTime />}
          /> */}
        <Route
          exact
          path="/DeskTime"
          element={<DeskTime />}
          />
      </Routes>
    </Router>
  );
};

export default App;