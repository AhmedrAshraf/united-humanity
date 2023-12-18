import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { database } from "../firebase";
import { doc, getDoc, query, collection, onSnapshot, orderBy, where } from "firebase/firestore";
import moment from "moment";
import Swiper from "react-native-swiper";
import { UserContext } from "../utils/UserContext";

const Profile = ({ navigation }) => {
  const { uid, setUid } = useContext(UserContext);
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    getUser();
    getPosts();
  }, []);

  const getUser = async () => {
    try {
      const docData = await getDoc(doc(database, "users", uid));
      const userData = docData.data();
      setUser(userData);

      // Count followers and following
      setFollowersCount(userData.followers ? userData.followers.length : 0);
      setFollowingCount(userData.following ? userData.following.length : 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const uri = user?.profilePic || "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getPosts = () => {
    const q = query(
      collection(database, "posts"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const postsArray = snap.docs.map((doc) => {
        const postData = doc.data();
        const creatorPic = postData.creatorPic || "https://default-profile-pic-url.com";
        return {
          ...postData,
          id: doc.id,
          creatorName: postData.creatorName,
          creatorPic,
        };
      });
      setPosts(postsArray);
    });

    return unsubscribe;
  };

  const getRelativeTime = (createdAt) => {
    const now = moment();
    const postTime = moment(createdAt);
    const diff = now.diff(postTime, "minutes");

    if (diff < 60) return `${diff} min ago`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)} hr ago`;
    if (diff < 60 * 24 * 30) return `${Math.floor(diff / (60 * 24))} d ago`;
    if (diff < 60 * 24 * 30 * 12) return `${Math.floor(diff / (60 * 24 * 30))} mo ago`;
    return `${Math.floor(diff / (60 * 24 * 30 * 12))} yr ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          style={styles.arrow}
          onPress={() => navigation.goBack()}
        />
        <Text style={{ fontSize: 20, fontFamily: 'Poppins-Medium' }}>Profile</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <MaterialIcons name={"settings"} size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl onRefresh={getPosts} />}>
        <View style={styles.profileContainer}>
          <View activeOpacity={0.9} style={styles.contentContainer}>
            <Image style={styles.previewImg} source={{ uri }} />
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user?.name || "Loading..."}</Text>
            <View>
              <Text style={{fontWeight: 600}}>
              Followers: {followersCount}
              </Text>
              <Text style={{fontWeight: 600}}>
              Following: {followingCount}
              </Text>
            </View>
            <Button
              mode="contained"
              uppercase={false}
              style={styles.editButton}
              onPress={() => navigation.navigate("Setting", user)}
            >
              Edit Profile
            </Button>
          </View>
        </View>

        {posts.map((post, idx) => (
          <View style={styles.post} key={idx}>
            <View style={styles.postHeader}>
              <Image style={styles.creatorPic} source={{ uri }} />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
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
                  <Image key={index} source={{ uri: url }} style={styles.postImage} />
                ))}
            </Swiper>
            <Text style={styles.postTitle}>{post.title}</Text>
          </View>
        ))}
    </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            navigation.navigate("AddPostScreen")}}>
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
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
  arrow: {
    fontSize: 30,
    color: "#000",
  },
  profileContainer: {
    width: "100%",
    paddingBottom: 50,
    paddingHorizontal: 15,
    marginTop: 20,
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
    fontFamily: 'Outfit-Regular',
  },
  userInfoContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    marginTop: -20,
    fontWeight: "500",
    fontFamily: 'Outfit-Regular'
  },
  editButton: {
    width: 120,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#01AEF0",
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
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatorPic: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 120,
    backgroundColor: "gainsboro",
  },
  creatorInfo: {
    marginLeft: 10,
  },
  creatorName: {
    fontSize: 18,
    fontFamily: 'Outfit-Regular',
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
  postTitle: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular'
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
});
