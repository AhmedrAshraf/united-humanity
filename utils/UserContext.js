import React, { useState, createContext, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { database } from "../firebase";

export const UserContext = createContext();

function UserProvider(props) {
  const [uid, setUid] = useState("");
  const [user, setUser] = useState();

  useEffect(() => {
    getUser();
  }, [uid]);

  const getUser = () => {
    if (uid) {
      const userRef = doc(database, "users", uid);
      getDoc(userRef).then((item) => setUser({ ...item.data(), uid: item.id }));
    }
  };

  return (
    <UserContext.Provider value={{ uid, setUid, user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserProvider;
