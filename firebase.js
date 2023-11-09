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
  apiKey: "AIzaSyDl0a5EVMwUjc4hz8jTLG-q_GKOdN3JqkE",
  authDomain: "united-humanity.firebaseapp.com",
  projectId: "united-humanity",
  storageBucket: "united-humanity.appspot.com",
  messagingSenderId: "445344269698",
  appId: "1:445344269698:web:9c8c390d377133800c7b9b",
  measurementId: "G-8BM9WVTPN5"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
