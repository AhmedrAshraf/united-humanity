import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import {
  query,
  collection,
  onSnapshot,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import Swiper from "react-native-swiper";
import { database } from "../firebase";
import { UserContext } from "../utils/UserContext";

const Home = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const uri = user?.profilePic || "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useEffect(() => {
    getPosts();
    getUsers();
  }, [user]);

  const getUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(database, "users"));
      const allUsers = querySnapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
      const filteredUsers = allUsers.filter((u) => u.uid !== user?.uid);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  const getPosts = () => {
    const q = query(collection(database, "posts"), orderBy("createdAt", "desc"));
  
    const unsubscribe = onSnapshot(q, async (snap) => {
      try {
        const postsArray = await Promise.all(
          snap.docs.map(async (doc) => {
            const postData = doc.data();
            const userId = postData.userId;
            const userQuerySnapshot = await getDocs(
              query(collection(database, "users"), where("uid", "==", userId))
            );
  
            const userData = userQuerySnapshot.docs[0]?.data();
            const creatorPic = userData?.profilePic || "https://default-profile-pic-url.com";
  
            return {
              ...postData,
              id: doc.id,
              creatorName: postData.creatorName || userData?.username,
              creatorPic,
            };
          })
        );
  
        const filteredPosts = postsArray.filter((post) => post && post.creatorName);
        setPosts(filteredPosts);
      } catch (error) {
        console.error("Error processing post data:", error);
      }
    });
  
    return unsubscribe;
  };

  function getRelativeTime(createdAt) {
    const now = moment();
    const postTime = moment(createdAt);
    const diff = now.diff(postTime, "minutes");

    const timeUnits = [
      { unit: "yr", divisor: 60 * 24 * 30 * 12 },
      { unit: "mo", divisor: 60 * 24 * 30 },
      { unit: "d", divisor: 60 * 24 },
      { unit: "hr", divisor: 60 },
      { unit: "min", divisor: 1 },
    ];

    for (const unit of timeUnits) {
      if (diff >= unit.divisor) {
        return `${Math.floor(diff / unit.divisor)} ${unit.unit} ago`;
      }
    }

    return "Just now";
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
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Home</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ProfileDetailScreen", user)}
        >
          <MaterialIcons name="settings" size={26} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ width: "100%" }}
        refreshControl={<RefreshControl onRefresh={getPosts} refreshing={loading} />}
      >
        {posts.map((post) => (
          <View style={styles.post} key={post.id}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image style={styles.previewImg} source={{ uri: post.creatorPic || uri }} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>{post.creatorName}</Text>
                <Text style={styles.postTime}>{post.createdAt && getRelativeTime(post.createdAt.toDate())}</Text>
              </View>
            </View>
            <Swiper
              containerStyle={styles.swiperContainer}
              activeDotColor="white"
              showsButtons={false}
              dotColor="silver"
              autoplay={true}
            >
              {Array.isArray(post.imageUrl) &&
                post.imageUrl.map((url, index) => (
                  <Image key={index} source={{ uri: url }} style={styles.postImage} />
                ))}
            </Swiper>
            <Text style={{ fontSize: 16, marginLeft: 10, fontWeight: "600" }}>{post.title}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddPostScreen")}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator size={40} color="#01AEF0" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    width: "100%",
    paddingBottom: 20,
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
    backgroundColor: "#01AEF0",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(100, 100, 100, .5)",
  },
  modalView: {
    padding: 30,
    elevation: 5,
    shadowRadius: 4,
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowColor: "#000",
    alignItems: "center",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 2 },
  },
});