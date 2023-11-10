import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import { database } from "../firebase";
import { UserContext } from "../utils/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  query,
  collection,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";
import Swiper from "react-native-swiper";

const Home = ({ navigation }) => {
  const { user } = useContext(UserContext);
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
    getDocs(q).then((snap) => {
      let list = snap.docs.map((e) => e.data());
      const filteredPosts = list.filter((post) => post.userId !== user.uid);
      setPosts(filteredPosts);
    });
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Profile", user)}
        >
          <Image style={styles.profilePic} source={{ uri }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>Home</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <MaterialIcons name={"settings"} size={26} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ width: "100%" }}
        refreshControl={<RefreshControl onRefresh={getPosts} />}
      >
        {posts.map((post, idx) => (
          <View style={styles.post} key={idx}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={styles.previewImg}
                source={{ uri: post?.creatorPic || cpi }}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>
                  {post?.username || post?.creatorName}
                </Text>
                <Text style={styles.postTime}>
                  {post.createdAt && getRelativeTime(post?.createdAt?.toDate())}
                </Text>
              </View>
            </View>
            <Swiper
              containerStyle={styles.swiperContainer}
              activeDotColor="white"
              showsButtons={false}
              dotColor="silver"
              autoplay={true}
            >
              {Array.isArray(post?.imageUrl) &&
               post?.imageUrl?.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.postImage}
                />
              ))}
            </Swiper>
            <Text style={{ fontSize: 16, marginLeft: 10, fontWeight: "600" }}>
              {post.title}
            </Text>
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
    backgroundColor: "#ffffff",
  },
  header: {
    width: "100%",
    paddingBottom: 20,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 25,
    shadowColor: "gainsboro",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  post: {
    marginTop: 25,
    padding: 10,
    paddingVertical: 10,
    width: "92%",
    marginHorizontal: "4%",
    shadowColor: "gainsboro",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
    borderRadius: 10,
    backgroundColor: "#fff",
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
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 120,
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
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  postTime: {
    fontSize: 14,
    color: "gray",
  },
  postImage: {
    height: 340,
    width: "95%",
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: "center",
    backgroundColor: "#f1f2f5",
  },
  swiperContainer: {
    height: 360,
    width: "100%",
  },
});
