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
  apiKey: "AIzaSyAra6JjR8V-O3QzR7_ouUHMD20Z2NrluJo",
  authDomain: "unit-test-602db.firebaseapp.com",
  projectId: "unit-test-602db",
  storageBucket: "unit-test-602db.appspot.com",
  messagingSenderId: "970635719885",
  appId: "1:970635719885:web:564bb5ff668e7c88fb2584"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
