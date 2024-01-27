// import { database } from './firebase'; // Adjust the path as needed

// export const fetchDataFromFirebase = async () => {
//   try {
//     console.log(database)
//     const response = await database.ref('/Posture').get();
//     if (response.exists()) {
//       return response.val();
//     } else {
//       console.log('No data available');
//       return null;
//     }
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };
