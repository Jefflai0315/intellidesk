import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCuSL4__P8LO6XYSwulQ1LisL-FtXoLnJw",
    authDomain: "intellidesk-174c9.firebaseapp.com",
    databaseURL: "https://intellidesk-174c9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "intellidesk-174c9",
    storageBucket: "intellidesk-174c9.appspot.com",
    messagingSenderId: "1003302596590",
    appId: "1:1003302596590:web:3191e92e25df77f54c28ff",
    measurementId: "G-6GPTQPECX8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

export default database;
