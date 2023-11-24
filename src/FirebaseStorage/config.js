import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD6o6DDt_xspQ4Juo2rKbOBPTBgs0dxQG0",
  authDomain: "soshiconnectimages.firebaseapp.com",
  projectId: "soshiconnectimages",
  storageBucket: "soshiconnectimages.appspot.com",
  messagingSenderId: "269456794060",
  appId: "1:269456794060:web:812edcb316e557f4e9bd69",
  measurementId: "G-R7F408CJF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const imageDb = getStorage(app);