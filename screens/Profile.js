import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, Feather, Entypo } from "@expo/vector-icons";
import { Text, View, Image, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity } from "react-native";
import { doc, getDoc, query, collection, arrayUnion, onSnapshot, arrayRemove, updateDoc, orderBy, where } from "firebase/firestore";
import { Button } from "react-native-paper";
import { database } from "../firebase";
import moment from "moment";
import Swiper from "react-native-swiper";
import { UserContext } from "../utils/UserContext";

const Profile = ({ navigation }) => {
  const { uid } = useContext(UserContext);
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [likedPosts, setLikedPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);

  useEffect(() => {
    getUser();
    getPosts();
  }, [user, likedPosts]);

  const getUser = async () => {
    try {
      const docData = await getDoc(doc(database, "users", uid));
      const userData = docData.data();
      setUser(userData);

      setFollowersCount(userData?.followers?.length || 0);
      setFollowingCount(userData?.following?.length || 0);

      setIsCurrentUserProfile(uid && user && uid === user.uid);
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
        return { ...postData, id: doc.id, creatorName: postData.creatorName, creatorPic };
      });
      setPosts(postsArray);
      setPostCount(postsArray.length);
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

  const handleLikeButtonClick = async (postId) => {
    try {
      const postIndex = likedPosts.indexOf(postId);
      const updateType = postIndex !== -1 ? arrayRemove(user?.uid) : arrayUnion(user?.uid);

      await updateDoc(doc(database, "posts", postId), { likes: updateType });
      setLikedPosts((prevLikedPosts) => (updateType === arrayRemove(user?.uid) ? prevLikedPosts.filter((id) => id !== postId) : [...prevLikedPosts, postId]));
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconsContainer}>
          <Feather name="arrow-left" style={styles.arrow} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontFamily: "Poppins-Medium" }}>Profile</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("Setting", user)} style={styles.iconsContainer}>
          <Entypo name={"dots-three-vertical"} size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl onRefresh={getPosts} />}>
        <View style={styles.profileContainer}>
          <View activeOpacity={0.9} style={styles.contentContainer}>
            <Image style={styles.previewImg} source={{ uri }} />
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{user?.name || "Loading..."}</Text>
            <Text style={styles.userName}>@{user?.username || "Loading..."}</Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
              {isCurrentUserProfile ? (
                <Button mode="contained" uppercase={false} style={styles.editButton} labelStyle={{ color: "#000", fontFamily: "Poppins-Medium" }} onPress={() => navigation.navigate("Setting", user)}>
                  Edit Profile
                </Button>
              ) : (
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Button mode="contained" uppercase={false} style={styles.editButton} labelStyle={{ color: "#000", fontFamily: "Poppins-Medium" }} onPress={() => navigation.navigate("Setting", user)}>
                    Follow
                  </Button>
                  <Button mode="contained" uppercase={false} style={styles.editButton} labelStyle={{ color: "#000", fontFamily: "Poppins-Medium" }} onPress={() => navigation.navigate("Setting", user)}>
                    Message
                  </Button>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.userFolowingDetailsContainer}>
          <View>
            <Text style={{ fontWeight: "bold", fontFamily: 'Poppins-Bold', textAlign: 'center' }}>{postCount}</Text>
            <Text>Posts</Text>
          </View>
          <View>
            <Text style={{ fontWeight: "bold", fontFamily: 'Poppins-Bold', textAlign: 'center' }}>{followersCount}</Text>
            <Text>Followers</Text>
          </View>
          <View>
            <Text style={{ fontWeight: "bold", fontFamily: 'Poppins-Bold', textAlign: 'center' }}>{followingCount}</Text>
            <Text>Following</Text>
          </View>
        </View>

        {posts.map((post, idx) => (
          <View style={styles.post} key={idx}>
            <View style={styles.postHeader}>
              <Image style={styles.creatorPic} source={{ uri }} />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{post?.username || post?.creatorName}</Text>
                <Text style={styles.postTime}>{post.createdAt && getRelativeTime(post?.createdAt?.toDate())}</Text>
              </View>
            </View>
            <Swiper containerStyle={styles.swiperContainer} activeDotColor="white" showsButtons={false} dotColor="silver" autoplay={true}>
              {Array.isArray(post?.imageUrl) && post?.imageUrl?.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.postImage} />
              ))}
            </Swiper>
            <TouchableOpacity style={styles.likeButton} onPress={() => handleLikeButtonClick(post.id)}>
              <FontAwesome name={post.likes && post.likes.includes(user?.uid) ? "heart" : "heart-o"} size={24} color={post.likes && post.likes.includes(user?.uid) ? "red" : "black"} />
            </TouchableOpacity>
            <Text style={styles.likeCount}>{post.likes ? `${post.likes.length} Likes` : '0 Likes'}</Text>
            <Text style={styles.postTitle}>{post.title}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddPostScreen")}>
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
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: "row",
    paddingHorizontal: 25,
    backgroundColor: "white",
    justifyContent: "space-between",
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: "gainsboro",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  arrow: {
    fontSize: 30,
    color: "#000",
  },
  profileContainer: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  userFolowingDetailsContainer: {
    width: "100%",
    display: 'flex',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    borderBottomColor: "gainsboro",
    alignItems: "center",
  },
  previewImg: {
    width: 90,
    height: 90,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "gainsboro",
  },
  contentContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginRight: 10,
  },
  userName: {
    fontSize: 12,
    fontFamily: "Outfit-Regular",
  },
  userInfoContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    marginTop: -20,
    fontWeight: "500",
    fontFamily: "Outfit-Regular",
  },
  editButton: {
    width: 120,
    elevation: 0,
    marginTop: 10,
    borderWidth: 1,
    marginRight: 20,
    borderRadius: 120,
    borderColor: "#E5E4E2",
    backgroundColor: '#E5E4E2',
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
    borderRadius: 10,
    backgroundColor: "gainsboro",
  },
  creatorInfo: {
    marginLeft: 10,
  },
  creatorName: {
    fontSize: 18,
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Poppins-Regular",
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
  iconsContainer: {
    borderColor: "gainsboro",
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
  },
  likeButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  likeCount: {
    marginLeft: 10,
    marginBottom: 10,
    color: "black",
    fontFamily: 'Poppins-Regular'
  },
});
