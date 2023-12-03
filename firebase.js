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
  apiKey: "AIzaSyB8558R4toI-OlXGLbVDQ-7jOkdZ20pFSQ",
  authDomain: "unit-dapp.firebaseapp.com",
  projectId: "unit-dapp",
  storageBucket: "unit-dapp.appspot.com",
  messagingSenderId: "398711679023",
  appId: "1:398711679023:web:fbaab5c34e5e399153feda"
};

const app = initializeApp(firebaseConfig);

initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
