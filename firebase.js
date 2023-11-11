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
  apiKey: "AIzaSyCe57OrzhDdCh5IjnoxAy1OOUnPjWidAVs",
  authDomain: "unit-2cf16.firebaseapp.com",
  projectId: "unit-2cf16",
  storageBucket: "unit-2cf16.appspot.com",
  messagingSenderId: "56494050271",
  appId: "1:56494050271:web:76e2771640fe7d5615526a"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
