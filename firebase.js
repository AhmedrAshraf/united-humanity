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
  apiKey: "AIzaSyCdlLC7xhlP4krcfEguUjDMcadlo6g_C4E",
  authDomain: "united-app-a0cdb.firebaseapp.com",
  projectId: "united-app-a0cdb",
  storageBucket: "united-app-a0cdb.appspot.com",
  messagingSenderId: "508958772432",
  appId: "1:508958772432:web:c5a3aa688b95b13c87e2d5"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
