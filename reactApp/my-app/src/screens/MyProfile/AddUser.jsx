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
import standAtTable from '../../imgs/Asset 54@720x.png';
import database from '../../firebase'; // Adjust the path as needed
import { query, ref, set,update, onValue, off} from 'firebase/database'

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

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };  

  const closePopup = (e) => {
    // If the popup is open and the clicked target is not our "i" icon or the popup content itself,
    // then close the popup.
    if (isPopupOpen && !e.target.closest('.info-icon, .popup')) {
      setIsPopupOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener to the document to close the popup when clicking anywhere on the screen.
    document.addEventListener('click', closePopup);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('click', closePopup);
    };
  }, [isPopupOpen]); // Depend on isPopupOpen so that the effect correctly handles its current state.

  const renderModal = () => {
    if (!isModalOpen) return null;
  
    return (
      <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'relative',
              top: '0', // Distance from the top
              left: '257px', // Distance from the right
              background: 'transparent',
              border: 'none',
              fontSize: '15px', // Adjust the size as needed
              color: '#fff',
              cursor: 'pointer'
            }}>
            X
          </button>
          <img src={standAtTable} className="stand-at-table" style={{
            maxWidth: '100%', // Ensures the image is not wider than the modal
            height: '100px', // Maintains aspect ratio
            display: 'block', // Ensures the image does not have extra space below (inline elements have space)
            margin: '10px auto',
          }} />
            <p 
              style={{
              color: '#fff', 
              fontSize: '14px', 
              textAlign: 'center', 
              lineHeight: '1.5', 
            }}>
              Proceed to your desk to set up biometric verification for {name}. 
              Once you are at your desk, center yourself in front of the desk and stand upright in front of it and click the 'Start' button.
            </p>
            <button 
            onClick={() => startBiometricRecording()}
            style={{
              position: 'relative',
              top: '0', // Distance from the top
              left: '115px', // Distance from the right
              background: '#444444',
              border: 'none',
              borderRadius: '5px',
              fontSize: '15px', // Adjust the size as needed
              color: '#A9FF9B',
              cursor: 'pointer',
              width: '70px',
              height: '25px',}}
            >
            Start
          </button>
        </div>
      </div>
    );
  };

  const startBiometricRecording=() => {
    setIsModalOpen(false);
    const bioRecordRef = ref(database, 'Controls/BiometricRecording')
    set(bioRecordRef, 1).catch((error) => {
      console.error("Error turn on Biometric Recording in Firebase", error);
    });
    setResult('Recording')
    // Listen for changes in the recording state
  const unsubscribe = onValue(bioRecordRef, (snapshot) => {
    const bioRecord = snapshot.val();
    console.log(bioRecord);

    // Check if recording is finished
    if (bioRecord === 2) {
      setResult('Finished');
      // Reset the biometric recording state in Firebase
      set(bioRecordRef, 0).catch((error) => {
        console.error("Error resetting Biometric Recording in Firebase", error);
      });

      // Unsubscribe from the changes to stop listening once the desired state is reached
      unsubscribe();
    }
  });
  }

    

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
    if (biometricEmbedding ===0){
      console.log('line 157')
      setError(prevError => (prevError ? `${prevError} \n Please set up biometric verification first.` : `Please set up biometric verification first.`));
    }

    if (error ===''){
      console.log('line 162')
      handleSave();
    }else{return}
    
  };

  const AddBiometric = async () => {
    //update the username to InputName at firebase 

    const InputNameRef = ref(database, 'Controls/InputName')
    set(InputNameRef, name).catch((error) => {
      console.error("Error updating InputName in Firebase", error);
    });
    
    if (name !== ''){
      try {
        // const response = await fetch('http://raspberry_pi_ip:8080'); //need to change the url
        // const jsonResult = await response.json();

        // // Update the state with the result
        const embeddingsRef = query(ref(database, 'Controls/FaceEmbeddings'));
        onValue(embeddingsRef, (snapshot) => {
          const embeddings = snapshot.val();
          setResult("Success");})

        // Reset any previous error
        setError('');
        //TODO: setBiometricEmbedding
        setBiometricEmbedding(1)
      } catch (err) {
        // Update the state with the error
        setError('Error: ' + err.message);
        // Optionally, handle errors, like showing error messages

        //setBiometricEmbedding
        setBiometricEmbedding(0)
      }
    }else{
      setError('Please fill in the name field first.');
    }
  };

  const handleSave = () => {
    if (!name || !age || !gender || !height || !weight || !biometricEmbedding){
      return;
    }
    console.log('handle save')
     // Perform the save operation, e.g., update Firebase with the user data
     const UserDetailRef = query(ref(database, name + '/Params'));
     update(UserDetailRef,{'Age': age, 'Gender': gender, 'Height': height, 'Weight': weight, "0": 80, "1":100, "2":120, "3":130,"4":150, "CaloriesBurnedGoal":500, "CaloriesBurned":0,"PsotureScore":0,"UprightStreak":0,"UprightTime":0}).catch((error) => { console.error("Error updating InputName in Firebase", error);})
    //  const embeddingRef = query(ref(database, 'Controls/FaceEmbeddings/'+name));
    //  update(embeddingRef, biometricEmbedding).catch((error) => { console.error("Error updating biometricEmbedding in Firebase", error);})
    // embedding upload from another script
    setBiometricEmbedding(0)
    setIsSaveModalOpen(true)
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
              <span className="info-icon" onMouseDown={(e) => e.stopPropagation()} onClick={togglePopup} style={{ cursor: 'pointer', marginLeft: '10px', top: '213px', position: 'absolute', left: '50px', fontSize: '20px' }}>
                ℹ️
              </span>
              {isPopupOpen && (
                <div className="popup" onMouseDown={(e) => e.stopPropagation()} style={{
                  position: 'absolute',
                  background: '#101010',
                  padding: '10px',
                  borderRadius: '5px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                  left: '50%', // Adjust based on actual layout
                  top: '30px', // Adjust based on actual layout
                  transform: 'translateX(-50%)',
                  zIndex: 100, // Ensure it's above other content
                }}>
                  Steps on how to do Biometric Verification...TO DO
                </div>
              )}
              {result && renderModal()}
              {result && (
                <div style={{textAlign: 'right', marginTop: '5px'}}>
                Result: {JSON.stringify(result)}
                </div>)}
            </div>
              <button className="done-button" onClick={ () =>{ AddNewUser()}}>
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
