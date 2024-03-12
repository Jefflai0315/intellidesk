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
import { query, ref, onValue, orderByKey , startAt, set} from 'firebase/database'

function AddUser() {
  // const [user, setUser] = useState('My')
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [lastFetchedTime, setLastFetchedTime] = useState();
   // State to store the fetched result
   const [result, setResult] = useState(null);
   // State to store any potential error
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [biometricEmbedding, setBiometricEmbedding] = useState(null);


   const handleSave = () => {
    console.log('handle save')
    // Perform the save operation, e.g., update Firebase with the user data
    // You can use the state variables (name, age, gender, height, weight) here
    // ...

    // Optionally, you can update the user state to reflect the changes

    // Optionally, reset the input fields after saving
  };


  const renderModal = () => {
    if (!isModalOpen) return null;
  
    return (
      <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'relative',
              top: '-2px', // Distance from the top
              left: '257px', // Distance from the right
              background: 'transparent',
              border: 'none',
              fontSize: '15px', // Adjust the size as needed
              color: '#fff',
              cursor: 'pointer'
            }}>
            X
          </button>
            <p style={{
              color: '#fff', 
              fontSize: '14px', 
              textAlign: 'center', 
              lineHeight: '1.3', 
            }}>
              Proceed to your table to set up biometric verification.
            </p>
        </div>
      </div>
    );
  };

  const renderSaveModal = () => {
    if (!isSaveModalOpen || error) return null;
  
    return (
      <div className="modal-backdrop" onClick={() => setIsSaveModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
        <Link to="/MyProfile">
          <button 
            onClick={() => setIsSaveModalOpen(false)}
            style={{
              position: 'relative',
              top: '-2px', // Distance from the top
              left: '257px', // Distance from the right
              background: 'transparent',
              border: 'none',
              fontSize: '15px', // Adjust the size as needed
              color: '#fff',
              cursor: 'pointer'
            }}>
            X
          </button>
          </Link>
            <p style={{
              color: '#fff', 
              fontSize: '14px', 
              textAlign: 'center', 
              lineHeight: '1.3', 
            }}>
              User data Added
            </p>
        </div>
      </div>
    );
  };

  // Handler function for the button click
  const AddNewUser = async () => {
    //update the username to InputName at firebase 

    // const InputNameRef = ref(database, 'Controls/InputName')
    // set(InputNameRef, name).catch((error) => {
    //   console.error("Error updating InputName in Firebase", error);
    // });
    setError('');

    if (!name || !age || !gender || !height || !weight) {
      // If any of the fields is empty, show an error message
      setError('Please fill in all fields.');
    }
    // Update the error state to an empty string to clear any previous errors
    if (!biometricEmbedding){
      setError(prevError => (prevError ? `${prevError} \n Please set up biometric verification first.` : `Please set up biometric verification first.`));
    }

    if (error ===''){
      handleSave();
    }else{return}
    
  };

  const AddBiometric = async () => {
    //update the username to InputName at firebase 

    const InputNameRef = ref(database, 'Controls/InputName')
    set(InputNameRef, name).catch((error) => {
      console.error("Error updating InputName in Firebase", error);
    });
    

    try {
      const response = await fetch('http://raspberry_pi_ip:8080'); //need to change the url
      const jsonResult = await response.json();

      // Update the state with the result
      setResult(jsonResult);
      // Reset any previous error
      setError('');
      // Optionally, handle the result accordingly, like updating UI

       //setBiometricEmbedding
       setBiometricEmbedding(null)
    } catch (err) {
      // Update the state with the error
      setError('Error: ' + err.message);
      // Optionally, handle errors, like showing error messages

      //setBiometricEmbedding
      setBiometricEmbedding(null)
    }
  };

  // Render the error pop-up
  const renderErrorPopup = () => {
    if (!error) return null;

    return (
      <div className="error-popup">
        <p>{error}</p>
        <button onClick={() => setError('')}>Close</button>
      </div>
    );
  };
  
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
                  <div className="profile-card-add-user">
                    <div className="profile-picture">
                      <span>add profile photo</span>
                    </div>
                    <div className="profile-info">
            <div className="profile-info-item">
              <div className="info-section">
                <span className="label">Name:</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="profile-input name-input" style={{color: '#fff'}}/>
              </div>
              <div className="info-section">
                <span className="label">Age:</span>
                <input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="profile-input age-input" style={{color: '#fff'}}/>
                <span className="unit-au"> years</span>
              </div>
              <div className="info-section">
                <span className="label">Gender:</span>
                <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="profile-input gender-input" style={{color: '#fff'}}/>
              </div>
              <div className="info-section">
                <span className="label">Height:</span>
                <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} className="profile-input height-input" style={{color: '#fff'}}/>
                <span className="unit-au"> cm</span>
              </div>
              <div className="info-section">
                <span className="label">Weight:</span>
                <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="profile-input weight-input" style={{color: '#fff'}}/>
                <span className="unit-au"> kg</span>
              </div>
              <div>
              <button className="bio-verif-button" onClick={ () => {setIsModalOpen(true); AddBiometric() }} id="setupProfileButton">
                Set Up Biometric Verification
              </button>
              {result && renderModal()}
              {result && <div>Result: {JSON.stringify(result)}</div>}
            </div>
              <button className="done-button" onClick={ () =>{ setIsSaveModalOpen(true); AddNewUser()}}>
                Save
              </button>
              {renderSaveModal()}
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </div>
                </div>
              </div>
              <div className="text-wrapper-14">My Profile</div>
              <Link to="/MyProfile">
              <img className="frame-2" alt="Frame" src="https://c.animaapp.com/QHWYwOlz/img/frame-3.svg" />
              </Link>             
            </div>
          </div>
        </div>
      </div>
      <div>
    </div>
    </div>
  );
};

export default AddUser;
