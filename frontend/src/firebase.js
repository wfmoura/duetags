
/* eslint-disable no-undef */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBT21uSPNgTsiwYSWsKKdFhCkA7C2TeCYw",
  authDomain: "duetags-33cf1.firebaseapp.com",
  projectId: "duetags-33cf1",
  storageBucket: "duetags-33cf1.firebasestorage.app",
  messagingSenderId: "947148759444",
  appId: "1:947148759444:web:be4cab638390f1c74b6f81",
  measurementId: "G-XYFS0TRDNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { storage, analytics };