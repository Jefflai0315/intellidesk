import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './screens/Home/Home';
import Posture from './screens/Posture/Posture';
import ScreenDistance from './screens/ScreenDistance/ScreenDistance';
import DeskTime from './screens/DeskTime/DeskTime';
import DailyActivity from './screens/DailyActivity/DailyActivity';
import MyProfile from './screens/MyProfile/MyProfile';
import AddUser from './screens/MyProfile/AddUser';
import EditUser from './screens/MyProfile/EditUser';


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
          path="/ScreenDistance"
          element={<ScreenDistance />}
          />
        <Route
          exact
          path="/DeskTime"
          element={<DeskTime />}
          />
        <Route
          exact
          path="/DailyActivity"
          element={<DailyActivity />}
          />
        <Route
          exact
          path="/MyProfile"
          element={<MyProfile />}
          />
          <Route
          exact
          path="/AddUser"
          element={<AddUser />}
          />
          <Route
          exact
          path="/EditUser"
          element={<EditUser />}
          />
      </Routes>
    </Router>
  );
};

export default App;