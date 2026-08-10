// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-e0458.firebaseapp.com",
  projectId: "interviewiq-e0458",
  storageBucket: "interviewiq-e0458.firebasestorage.app",
  messagingSenderId: "249604550999",
  appId: "1:249604550999:web:16e681f0cae2aca7894e12"
};


const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

const provider=new GoogleAuthProvider()

export {auth,provider}