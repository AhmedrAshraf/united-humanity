import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth/react-native";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBHzv7abD_Z-00bkQyWcnv0eiF0npUf50",
  authDomain: "unity-test-a931c.firebaseapp.com",
  projectId: "unity-test-a931c",
  storageBucket: "unity-test-a931c.appspot.com",
  messagingSenderId: "889956407606",
  appId: "1:889956407606:web:153742cf2b5149a2733b97"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
