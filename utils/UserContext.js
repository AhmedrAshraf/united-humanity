import React, { useState, createContext } from "react";

export const UserContext = createContext();

function UserProvider(props) {
  const [uid, setUid] = useState("");

  return (
    <UserContext.Provider value={{ uid, setUid }}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserProvider;
