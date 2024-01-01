import React, { useState, createContext, useEffect } from "react";

export const UserContext = createContext();

function UserProvider(props) {
  const [uid, setUid] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let usr = await AsyncStorage.getItem("user");
    const usrr = JSON.parse(usr);
    setUser(usrr);
    setUid(usrr.uid);
  };

  return (
    <UserContext.Provider value={{ uid, setUid, user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserProvider;
