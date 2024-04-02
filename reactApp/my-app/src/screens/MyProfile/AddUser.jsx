import React, { useEffect, useState, useRef } from 'react';
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
import database from '../../firebase'; 
import { query, ref, set,update, onValue, off} from 'firebase/database'

function AddUser() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [lastFetchedTime, setLastFetchedTime] = useState();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [biometricEmbedding, setBiometricEmbedding] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const intervalId = useRef(null);
  const [progressCount, setProgressCount] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const [bioRecordCompleted, setBioRecordCompleted] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };  

  const closePopup = (e) => {
    if (isPopupOpen && !e.target.closest('.info-icon, .popup')) {
      setIsPopupOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closePopup);

    return () => {
      document.removeEventListener('click', closePopup);
    };
  }, [isPopupOpen]); 

  const trackBiometricRecording = () => {
    let bioRecordCompleted = false;
    setProgressCount(1); 
    setProgressMessage('Biometric verification setup in progress. 1/5 images taken.');
  
    const bioRecordRef = ref(database, 'Controls/BiometricRecording');
  
    const intervalId = setInterval(() => {
      setProgressCount((prevCount) => {
        if (prevCount < 5) {
          setProgressMessage(`Biometric verification setup in progress. ${prevCount + 1}/5 images taken.`);
          return prevCount + 1;
        } else {
          if (!bioRecordCompleted) {
            setProgressMessage("Processing images...");
          }
          return prevCount;
        }
      });
    }, 3000);
  
    // Listen for changes in the biometric recording state
    const unsubscribe = onValue(bioRecordRef, (snapshot) => {
      const bioRecord = snapshot.val();
      if (bioRecord === 2) {
        bioRecordCompleted = true;
        setProgressMessage("Biometric verification setup complete.");
        clearInterval(intervalId);
        unsubscribe();
      }
    });
  };

  const [bioRecordStatus, setBioRecordStatus] = useState(null);

  useEffect(() => {
    const bioRecordRef = ref(database, 'Controls/BiometricRecording');
  
    // Listen for changes in the BiometricRecording value
    const unsubscribe = onValue(bioRecordRef, (snapshot) => {
      const value = snapshot.val();
      setBioRecordStatus(value); 
    });
  
    // Cleanup function to unsubscribe from the Firebase listener
    return () => unsubscribe();
  }, []); 
  

  useEffect(() => {
    const bioRecordRef = ref(database, 'Controls/BiometricRecording');
  
    const unsubscribe = onValue(bioRecordRef, (snapshot) => {
      const value = snapshot.val();
      if (value === 2 && progressCount === 5) { 
        setBioRecordCompleted(true);
      }
    });
  
    return () => unsubscribe(); 
  }, []); 

  useEffect(() => {
    let intervalId;
  
    if (progressCount > 0 && progressCount < 7) {
      intervalId = setInterval(() => {
        setProgressCount((prevCount) => prevCount + 1);
      }, 3000); 
    } else if (progressCount === 6) {
      clearInterval(intervalId); 
      // The rest is handled by the Firebase listener
    }
  
    return () => clearInterval(intervalId); 
  }, [progressCount]);
  

  const handleStartButtonClick = () => {
    startBiometricRecording();
    trackBiometricRecording();
  };

  useEffect(() => {
    return () => clearInterval(intervalId.current);
  }, []);

  const renderModalContent = () => {
    if (progressCount === 0) {
      return (
        <p style={{ color: '#fff', fontSize: '14px', textAlign: 'left', lineHeight: '1.5', padding: '15px 10px' }}>
          Proceed to your desk to set up biometric verification for {name}. <br />
          <br />
          Once you are at your desk, center yourself in front of the desk and stand upright in front of it and click the 'Start' button.
        </p>
      );
    } else if (progressCount <= 5) {
      return (
        <p style={{ color: '#fff', fontSize: '14px', textAlign: 'center', lineHeight: '1.5', padding: '15px 10px' }}>
          Biometric verification setup in progress.<br />
          <br />
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#A9FF9B' }}>
            {progressCount}/5 images taken
          </span>
          {console.log(progressCount)}
          {console.log(bioRecordCompleted)}
        </p>
      );
    } else if (progressCount === 6) {
      return (
        <p style={{ color: '#A9FF9B', fontSize: '18px', textAlign: 'center', lineHeight: '1.5', padding: '15px 10px' }}>
          Processing images...{console.log(bioRecordCompleted)}
          {console.log(progressCount)}
        </p>
      );
    } else if (progressCount === 7 && bioRecordCompleted) {
      return (
        <p style={{ color: '#A9FF9B', fontSize: '20px', textAlign: 'center', lineHeight: '1.5', padding: '15px 10px' }}>
          Biometric verification setup complete.{console.log(progressCount)}
        </p>
      );
    } else if (progressCount === 7) {
      return (
        <p style={{ color: '#A9FF9B', fontSize: '16px', textAlign: 'center', lineHeight: '1.5', padding: '15px 10px' }}>
          Updating user database...{console.log(progressCount)}
        </p>
      );
    }
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
              top: '0',
              left: '257px', 
              background: 'transparent',
              border: 'none',
              fontSize: '15px', 
              color: '#fff',
              cursor: 'pointer'
            }}>
            X
          </button>
          <img src={standAtTable} className="stand-at-table" style={{
            maxWidth: '100%', 
            height: '100px',
            display: 'block', 
            margin: '10px auto',
          }} />
          {renderModalContent()}
            {progressCount === 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleStartButtonClick();
                  setIsModalOpen(true);
                }}
                style={{
                  position: 'relative',
                  top: '0', 
                  left: '115px', 
                  background: '#444444',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '15px', 
                  color: '#A9FF9B',
                  cursor: 'pointer',
                  width: '70px',
                  height: '25px',
                }}
              >
                Start
              </button>
            )}
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
  const unsubscribe = onValue(bioRecordRef, (snapshot) => {
    const bioRecord = snapshot.val();
    console.log(bioRecord);

    if (bioRecord === 2) {
      setBioRecordCompleted(true);
      setResult('Finished');
      set(bioRecordRef, 0).catch((error) => {
        console.error("Error resetting Biometric Recording in Firebase", error);
      });
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
              top: '-2px', 
              left: '257px', 
              background: 'transparent',
              border: 'none',
              fontSize: '15px', 
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
              User data saved
            </p>
        </div>
      </div>
    );
  };

  // Handler function for the button click
  const AddNewUser = async () => {
    setError('');

    if (!name || !age || !gender || !height || !weight) {
      setError('Please fill in all fields.');
    }
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
    setBioRecordCompleted(false);

    const InputNameRef = ref(database, 'Controls/InputName')
    set(InputNameRef, name).catch((error) => {
      console.error("Error updating InputName in Firebase", error);
    });
    
    if (name !== ''){
      try {
        const embeddingsRef = query(ref(database, 'Controls/FaceEmbeddings'));
        onValue(embeddingsRef, (snapshot) => {
          const embeddings = snapshot.val();
          setResult("Success");})

        setError('');
        setBiometricEmbedding(1)
      } catch (err) {
        setError('Error: ' + err.message);

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
     const UserDetailRef = query(ref(database, name + '/Params'));
     update(UserDetailRef,{'Age': age, 'Gender': gender, 'Height': height, 'Weight': weight, "0": 80, "1":100, "2":120, "3":130,"4":150, "CaloriesBurnedGoal":500, "CaloriesBurned":0,"PsotureScore":0,"UprightStreak":0,"UprightTime":0}).catch((error) => { console.error("Error updating InputName in Firebase", error);})

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
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  className="profile-input gender-input2" 
                  style={{width: '61%', height: '25px', color: '#fff', backgroundColor: '#757575', boxSizing: 'border-box', border: '1.5px solid #000'}}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to disclose">Prefer not to disclose</option>
                </select>
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
                <span className="info-icon" onMouseDown={(e) => e.stopPropagation()} onClick={togglePopup} style={{ cursor: 'pointer', marginLeft: '10px', top: '214px', position: 'absolute', left: '30px', fontSize: '20px', width: '23px', height: '23px', backgroundColor: '#444444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',     borderRadius: '50%', padding: '5px', boxSizing: 'border-box' }}>
                ℹ️
              </span>
              {isPopupOpen && (
                <div className="popup" onMouseDown={(e) => e.stopPropagation()} style={{
                  position: 'absolute',
                  background: '#252525',
                  width: '250px',
                  lineHeight: '1.3',
                  padding: '25px 13px',
                  borderRadius: '5px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                  left: '50%', 
                  top: '30px', 
                  transform: 'translateX(-50%)',
                  zIndex: 100, 
                }}>
                  Fill up all the relevant information fields above and click the 'Set Up Biometric Verification' button to proceed. <br /><br />
                  Once you have set up biometric verification, you can save your profile by clicking the 'Save' button.
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
