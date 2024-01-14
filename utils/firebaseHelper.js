// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyA3VxVY0b_SXMv3OcpPEu5uZ3ztDStMvMI",
    authDomain: "pandatv-sa.firebaseapp.com",
    projectId: "pandatv-sa",
    storageBucket: "pandatv-sa.appspot.com",
    messagingSenderId: "1083096580008",
    appId: "1:1083096580008:web:d33cd3b7bee83c37e2a79d",
  };

  // Initialize Firebase
  return initializeApp(firebaseConfig);
};
