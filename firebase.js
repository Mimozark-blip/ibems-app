import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  get,
  off,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAxVnKZ5uSp8PU5QXBRwQyuBulAwdVRBdA",
  authDomain: "earthquake-ccfcd.firebaseapp.com",
  databaseURL:
    "https://earthquake-ccfcd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "earthquake-ccfcd",
  storageBucket: "earthquake-ccfcd.firebasestorage.app",
  messagingSenderId: "497224044828",
  appId: "1:497224044828:web:12474c11492b0fa2e6aad9",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set, push, get, off };
