import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import { database } from "../firebase";
import logo from "../assets/appLogo.png";
import { UserContext } from "../utils/UserContext";
import { Image as OptimizedImage } from "expo-image";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  query,
  where,
  collection,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

const Home = ({ navigation }) => {
  const { user, uid, setUid } = useContext(UserContext);
  const [posts, setPosts] = useState([]);

  const uri =
    user?.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const cpi =
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = () => {
    const q = query(
      collection(database, "posts"),
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.profilePic} source={{ uri }} />
        <Text style={{ fontSize: 20, fontWeight: 600 }}>Home</Text>
        <TouchableOpacity
          style={styles.but}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <MaterialIcons name={"settings"} size={22} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView refreshControl={<RefreshControl onRefresh={getPosts} />}>
        {posts.map((post, idx) => (
          <View style={styles.post} key={idx}>

            <View activeOpacity={0.9} style={styles.content}>
              <View style={{ flexDirection: "row" }}>
                <Image style={styles.previewImg} source={{ uri: post.creatorPic || cpi }} />
                <Text style={styles.name}>
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
      </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            navigation.navigate("AddPostScreen");
          }}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f2f5",
  },
  but: {
    width: 35,
    height: 35,
    marginRight: 10,
    borderRadius: 50,
    alignItems: "center",
    backgroundColor: "#009c55",
    justifyContent: "center",
  },
  header: {
    width: "95%",
    marginBottom: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    width: 60,
    height: 60,
  },
  post: {
    marginVertical: 10,
    padding: 5,
    paddingVertical: 10,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  imgBox: {
    width: 40,
    height: 40,
    shadowColor: "gainsboro",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    borderRadius: 100,
    backgroundColor: "white",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  brand: {
    fontSize: 16,
    marginBottom: 3,
    textTransform: "capitalize",
  },
  package: {
    fontSize: 10,
    color: "gray",
    width: Dimensions.get("window").width * 0.45,
  },
  read: {
    color: "gray",
    marginBottom: 5,
  },
  searchContainer: {
    width: "92%",
    alignSelf: "center",
    position: "relative",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchInput: {
    margin: 3,
    height: 40,
    width: "100%",
    elevation: 4,
    shadowRadius: 3,
    shadowOpacity: 1,
    borderRadius: 100,
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 0 },
  },
  searchIcon: {
    right: 20,
    fontSize: 20,
    color: "#858C94",
    position: "absolute",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#009c55",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    width: 50,
    height: 50,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  content: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "colun",
    // alignItems: "center",
  },
  name: {
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
