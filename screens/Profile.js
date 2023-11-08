import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { database } from "../firebase";
import moment from "moment";
import logo from "../assets/appLogo.png";
import { Button } from "react-native-paper";
import { doc, getDoc } from "firebase/firestore";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../utils/UserContext";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  query,
  collection,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

const Profile = ({ navigation }) => {
  const { uid, setUid } = useContext(UserContext);

  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);

  function getRelativeTime(createdAt) {
    const now = moment();
    const postTime = moment(createdAt);
    const diff = now.diff(postTime, "minutes");

    if (diff < 60) return `${diff} min ago`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)} hr ago`;
    if (diff < 60 * 24 * 30) return `${Math.floor(diff / (60 * 24))} d ago`;
    if (diff < 60 * 24 * 30 * 12)
      return `${Math.floor(diff / (60 * 24 * 30))} mo ago`;
    return `${Math.floor(diff / (60 * 24 * 30 * 12))} yr ago`;
  }

  useEffect(() => {
    getUser();
  }, []);

  const getUser = () => {
    getDoc(doc(database, "users", uid)).then((docData) => {
      setUser(docData.data());
    });
  };

  const uri =
    user?.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = () => {
    const q = query(
      collection(database, "posts"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const postsArray = snap.docs.map((doc) => {
        const postData = doc.data();
        const creatorPic =
          postData.creatorPic || "https://default-profile-pic-url.com";
        return {
          ...postData,
          id: doc.id,
          creatorName: postData.creatorName,
          creatorPic: creatorPic,
        };
      });
      setPosts(postsArray);
    });
    return unsubscribe;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          style={styles.arrow}
          onPress={() => navigation.goBack()}
        />
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Profile</Text>
        <TouchableOpacity
          style={styles.settingBut}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <MaterialIcons name={"settings"} size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl onRefresh={getPosts} />}>
        <View style={styles.ProfileContainer}>
          <View activeOpacity={0.9} style={styles.contentContainer}>
            <Image style={styles.previewImg} source={{ uri }} />
          </View>
          <Text style={styles.name}>{user?.name || "Loading..."}</Text>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}>
            <Text style={styles.userName}>{user?.username || "Loading..."}</Text>
            <Button
              mode="contained"
              uppercase={false}
              style={styles.editBut}
              onPress={() => navigation.navigate("Setting", user)}>
              Edit Profile
            </Button>
          </View>
        </View>

        {posts.map((post, idx) => (
          <View style={styles.post} key={idx}>
            <View activeOpacity={0.9} style={styles.postContent}>
              <View style={{ flexDirection: "row" }}>
                <Image
                  style={styles.creatorPic}
                  source={{ uri: post.creatorPic || cpi }}
                />
                <Text style={styles.creatorName}>
                  {post?.creatorName || "Loading..."}
                </Text>
              </View>
              <View>
                <Text style={styles.postTime}>
                  {post.createdAt
                    ? getRelativeTime(post.createdAt.toDate())
                    : "Loading..."}
                </Text>
              </View>
              <View style={{ marginTop: 20, marginLeft: 10 }}>
                <Text style={{ fontSize: 22 }}>{post.title}</Text>

                {post.imageUrl && (
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postImage}
                  />
                )}
              </View>
            </View>
          </View>
        ))}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigation.navigate("AddPostScreen");
            }}>
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f5",
  },
  header: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arrow: {
    fontSize: 30,
    color: "#009c55",
  },
  ProfileContainer: {
    width: "100%",
    paddingBottom: 50,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    flexDirection: "row",
    borderBottomColor: "gainsboro",
    alignItems: "center",
  },
  previewImg: {
    width: 90,
    height: 90,
    marginBottom: 20,
    borderRadius: 120,
    backgroundColor: "gainsboro",
  },
  contentContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginRight: 20,
  },
  name: {
    position: "absolute",
    left: 25,
    bottom: 25,
    fontSize: 18,
    fontWeight: "600",
  },
  userName: {
    fontSize: 20,
    marginTop: -20,
    fontWeight: 500,
  },
  settingBut: {
    width: 35,
    height: 35,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#009c55",
  },
  editBut: {
    width: 120,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#009c55",
  },
  post: {
    width: "95%",
    padding: 5,
    marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  postContent: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "colun",
  },
  creatorPic: {
    width: 50,
    height: 50,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  creatorName: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
  },
  postTime: {
    fontSize: 18,
    marginLeft: 60,
    marginTop: -20,
    color: "gray",
  },
});
