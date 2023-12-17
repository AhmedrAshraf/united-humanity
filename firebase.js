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
  apiKey: "AIzaSyA5eW8x_kwRy1n-9cSNYclWYS6EunOHpIs",
  authDomain: "unnitt-7b0de.firebaseapp.com",
  projectId: "unnitt-7b0de",
  storageBucket: "unnitt-7b0de.appspot.com",
  messagingSenderId: "364758846842",
  appId: "1:364758846842:web:7f777152c433dd96b41ac3"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
