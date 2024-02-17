import {
  doc,
  where,
  query,
  limit,
  getDoc,
  orderBy,
  getDocs,
  updateDoc,
  collection,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import React, { useState, createContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

function UserProvider(props) {
  const [uid, setUid] = useState("");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let usr = await AsyncStorage.getItem("user");
    const usrr = JSON.parse(usr);
    if (usrr) {
      setUser(usrr);
      setUid(usrr.uid);
      if (usrr?.following?.length) {
        fetchPosts(usrr?.following);
        setFollowingList(usrr?.following);
      }
      if (usrr?.followers?.length) {
        setFollowersList(usrr?.followers);
      }
    }
  };

  const fetchDataForUser = async (userId, list) => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "posts"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(5)
        )
      );
      const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return posts;
    } catch (error) {
      console.error("Error fetching data for user", userId, error);
      return { userId, error: true };
    }
  };

  const fetchPosts = async (list) => {
    try {
      setLoading(true);

      const promises = list.map((userId) => fetchDataForUser(userId, list));
      const posts = await Promise.all(promises);
      const allPosts = [].concat(...posts);

      const sortedPosts = allPosts.sort((a, b) => a.createdAt - b.createdAt);
      console.log(
        "🚀 ~ file: UserContext.js:75 ~ fetchPosts ~ sortedPosts:",
        sortedPosts
      );

      setPosts(sortedPosts);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        uid,
        setUid,
        loading,
        setLoading,
        user,
        setUser,
        posts,
        setPosts,
        followingList,
        setFollowingList,
        followersList,
        setFollowersList,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export default UserProvider;
