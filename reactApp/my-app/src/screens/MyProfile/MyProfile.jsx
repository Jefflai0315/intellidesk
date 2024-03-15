import React, { useEffect, useState } from 'react';
import { BotBar_Home } from "../../components/BotBar_Home";
import "./style.css";
import { Link } from 'react-router-dom';
import logoImage from '../../imgs/logo@720x.png';
import profileGreen from '../../imgs/Asset 42@720x.png';
import tableIcon from '../../imgs/Group 28table.png';
import moreIcon from '../../imgs/Group 27more.png';
import tickIcon from '../../imgs/Asset 51@720x.png';
import tickWhite from '../../imgs/Asset 52@720x.png';
import goalsIcon from '../../imgs/Asset 14@720x.png';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, onValue, get, set} from 'firebase/database'

function ProfileHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState('');
  const [userlist, setUserlist] = useState([]);

  useEffect(() => {
    const UserRef = query(ref(database, 'Controls/User'));
    onValue(UserRef, (snapshot) => {
    const data = snapshot.val();
    setUser((prevUser) => {
      console.log('Updated user:', data);
      return data;
    });
     })
    const usersRef = query(ref(database, 'Controls/FaceEmbeddings'));
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setUserlist(Object.keys(data));
    })

  },[]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const updateUserSelection = (selectedUser) => {
    setUser(selectedUser); // Update state
    setDropdownOpen(false); // Close dropdown
    
    // Update Firebase
    const UserRef = query(ref(database, 'Controls/User'));
    set(UserRef, selectedUser).catch(error => {
      console.error("Error updating user in Firebase: ", error);
    });
  };

  return (
    // <div className="profile-header" onClick={toggleDropdown}>
    //   <h1>{user}</h1>
    //   <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>◀</span>
    //   {dropdownOpen && (
    //     <div className="dropdown-content">
    //       {/* Dropdown items go here */}
    //       {userlist.map((user) => (
    //         <div key={user} onClick={() => {
    //           setUser(user)
    //           //update firebase
    //           const UserRef = query(ref(database, 'Controls/User'));
    //           set(UserRef, user);
    //         }
    //         } >{user} </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
    <div className="profile-header" onClick={toggleDropdown}>
    <h1>{user}</h1>
    <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>◀</span>
    {dropdownOpen && (
      <div className="dropdown-content">
        {userlist.map((item) => (
          <div 
            key={item} 
            onClick={() => updateUserSelection(item)}
            style={{
              backgroundColor: item === user ? 'rgb(68, 68, 68)' : '#3B3B3B', // Highlight the selected user
              color: item === user ? '#A9FF9B' : '#fff', // Change text color for the selected user
              fontWeight: item === user ? 'bold' : 'normal',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '21px'
            }}
          >
            {item}
          </div>
        ))}
      </div>
    )}
  </div>
  );
}

function MyProfile() {
  const [user, setUser] = useState('')
  const [lastFetchedTime, setLastFetchedTime] = useState();
  const [age, setAge] = useState();
  const [height, setHeight] = useState();
  const [weight, setWeight] = useState();
  const [gender, setGender] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const ESRef = query(ref(database, 'Controls/User'));
      const esSnapshot = await get(ESRef);
      const userData = esSnapshot.val();
      
      setUser(userData);
      setLastFetchedTime(userData);

      const userRef = query(ref(database, userData + '/Params'));
      const userSnapshot = await get(userRef);
      const userParams = userSnapshot.val();

      setAge(userParams.Age);
      setHeight(userParams.Height);
      setWeight(userParams.Weight);
      setGender(userParams.Gender);
    };

    fetchData();
  }, []);


  return (
    <div className="my-profile">
      <div className="overlap-wrapper">
        <div className="overlap">
          <div className="background" />
          <div className="title">
            <div className="overlap-group">
              <img src={logoImage} alt="Intellidesk Logo" className="logo-wrapper" />
              <div className="line" style={{ height: '2px', backgroundColor: '#A9FF9B', width: '100%' }}></div> 
            </div>
          </div>
          <BotBar_Home className="bot-bar-home-instance-node" />
          <div className="bot-bar-home">
            <div className="div">
              <div className="group">
                <div className="text-wrapper-2">More</div>
                <img src={moreIcon} alt="More Icon" className="more-icon-wrapper" />
              </div>
              <Link to="/MyProfile">
                <div className="text-wrapper-3">My Profile</div>
                <img src={profileGreen} alt="Timer Icon" className="profile-icon-wrapper" />
              </Link>
              <div className="overlap-group-wrapper">
                <Link to="/">
                  <div className="overlap-2">
                    <div className="text-wrapper-4">My Day</div>
                    <div className="group-4">
                      <img src={tickWhite} alt="Tick Icon" className="tick-icon-wrapper" />
                    </div>
                  </div>
                </Link>
              </div>
              <div className="group-5">
                <div className="text-wrapper-5">My Table</div>
                <img src={tableIcon} alt="Table Icon" className="table-icon-wrapper" />
              </div>
              <div className="group-7">
                <div className="text-wrapper-6">My Goals</div>
              </div>
              <img src={goalsIcon} alt="Goals Icon" className="goals-icon-wrapper" />
            </div>
          </div>
          <div className="frame">
            <div className="overlap-3">
              <div className="group-8">
                <div className="overlap-group-3">
                  <div className="profile-card">
                    <ProfileHeader />
                    {/* <div className="buffer" />
                    <Link to='/EditUser'>
                      <button className="edit-button" >Edit</button>
                    </Link>
                    <Link to="/AddUser">
                      <button className="add-button">
                        <span>+ user</span>
                      </button>
                    </Link> */}
                    <div className="profile-info">
                      <div className="buffer" />
                      <Link to='/EditUser'>
                        <button className="edit-button" >Edit</button>
                      </Link>
                      <Link to="/AddUser">
                        <button className="add-button">
                          <span>+ user</span>
                        </button>
                      </Link>
                      <div className="profile-info-item">
                        <div className="info-section">
                          <span className="label">Name:</span>
                          <span className="value2">{user}</span>
                        </div>
                        <div className="info-section">
                          <span className="label">Age:</span>
                          <span className="value2">{age}</span>
                          <span className="unit"> years</span>
                        </div>
                        <div className="info-section">
                          <span className="label">Gender:</span>
                          <span className="value2">{gender}</span>
                        </div>
                        <div className="info-section">
                          <span className="label">Height:</span>
                          <span className="value2">{height}</span>
                          <span className="unit" style={{ right: '13px' }}> cm</span>
                        </div>
                        <div className="info-section">
                          <span className="label">Weight:</span>
                          <span className="value2">{weight}</span>
                          <span className="unit" style={{ right: '17px' }}> kg</span>
                        </div>
                        <button className="done-button">Done</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-wrapper-14">My Profile</div>
              <Link to="/">
              <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              </Link>             
            </div>
          </div>
        </div>
      </div>
      {/* <Link to="/AddUser">
        <div className="add-user">Add User</div>
      </Link> */}
    </div>
  );
};

export default MyProfile;
