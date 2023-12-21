import React, { useContext, useEffect, useState, useRef } from "react";
import { Text, View, Image, Modal, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { 
  query, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  updateDoc, 
  orderBy, 
  getDocs, 
  where, 
  doc, 
  getDoc 
} from "firebase/firestore";
import Swiper from "react-native-swiper";
import Slider from '@react-native-community/slider';
import { Video } from 'expo-av';
import { database } from "../firebase";
import { UserContext } from "../utils/UserContext";

const Home = ({ navigation }) => {
  const videoRef = useRef(null);
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const uri = user?.profilePic || "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useEffect(() => {
    fetchData();
  }, [user, following.length, likedPosts]);

  const handleLikeButtonClick = async (postId) => {
    try {
      const postIndex = likedPosts.indexOf(postId);
      const updateType = postIndex !== -1 ? arrayRemove(user?.uid) : arrayUnion(user?.uid);
      await updateLikes(postId, updateType);
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const updateLikes = async (postId, updateType) => {
    await updateDoc(doc(database, "posts", postId), { likes: updateType });
    setLikedPosts((prevLikedPosts) => (
      updateType === arrayRemove(user?.uid) ? prevLikedPosts.filter((id) => id !== postId) : [...prevLikedPosts, postId]
    ));
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!following.length && user?.uid) {
        const userDocRef = doc(collection(database, "users"), user.uid);
        const userDoc = await getDoc(userDocRef);
        const updatedFollowing = (userDoc.data()?.following || []).map(String);
        setFollowing(updatedFollowing);
      }

      const allPostsQuery = query(collection(database, "posts"), orderBy("createdAt", "desc"));
      const followingPostsQuery = following.length > 0 ? query(collection(database, "posts"), where("userId", "in", following), orderBy("createdAt", "desc")) : null;

      const queryToUse = followingPostsQuery || allPostsQuery;
      const snap = await getDocs(queryToUse);
      const postsData = snap.docs.map((doc) => processPost(doc));

      const followingPosts = await Promise.all(snap.docs.map(async (doc) => await processPost(doc)));
      const allPostsSnapshot = await getDocs(allPostsQuery);
      const allPosts = await Promise.all(allPostsSnapshot.docs.map((doc) => processPost(doc)));

      const uniquePostsSet = new Set(allPosts.map((post) => post.id));
      const uniqueFollowingPosts = followingPosts.filter((post) => !uniquePostsSet.has(post.id));

      setPosts(uniqueFollowingPosts.concat(allPosts).filter((post) => post.userId !== user?.uid));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleFollowerButtonClick = async (postUserId) => {
    try {
      const userDocRef = doc(collection(database, "users"), user?.uid);
      const targetUserDocRef = doc(collection(database, "users"), postUserId);
      const userDoc = await getDoc(userDocRef);
      const currentUserData = userDoc.data();
      const stringPostUserId = postUserId.toString();
      const isFollowing = (currentUserData.following || []).includes(stringPostUserId);

      const followingUpdate = isFollowing ? arrayRemove(stringPostUserId) : arrayUnion(stringPostUserId);
      await updateDoc(userDocRef, { following: followingUpdate });
      await updateDoc(targetUserDocRef, { followers: followingUpdate });

      setFollowing((prevFollowing) => (
        isFollowing ? prevFollowing.filter((id) => id !== stringPostUserId) : [...prevFollowing, stringPostUserId]
      ));
    } catch (error) {
      console.error("Error updating following:", error);
    }
  };

  const processPost = async (doc) => {
    try {
      const postData = doc.data();
      const userData = (await getDocs(query(collection(database, "users"), where("uid", "==", postData.userId))))?.docs[0]?.data() || {};

      return {
        ...postData,
        id: doc.id,
        creatorName: postData.creatorName || userData?.username,
        creatorPic: userData?.profilePic || "https://default-profile-pic-url.com",
        likes: postData.likes || [],
      };
    } catch (error) {
      console.error("Error processing post data:", error);
      return null;
    }
  };

  const getRelativeTime = (createdAt) => {
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
  };

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSeek = async (seconds) => {
    const newPosition = Math.max(0, Math.min(currentPosition + seconds * 1000, videoDuration));
    await videoRef.current.setPositionAsync(newPosition);
    setCurrentPosition(newPosition);
  };

  const toggleVideoPlayback = () => {
    if (isVideoPlaying) videoRef.current.pauseAsync();
    else videoRef.current.playAsync();
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleSliderChange = (value) => {
    videoRef.current.setPositionAsync(value * videoDuration);
    setCurrentPosition(value * videoDuration);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("Profile", user)}>
          <Image style={styles.profilePic} source={{ uri }} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("ProfileDetailScreen", user)}>
          <MaterialIcons name="settings" size={26} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={loading} />}>
        {posts.map((post) => (
          <View style={styles.post} key={post.id}>
            <View style={styles.postHeader}>
              <Image style={styles.previewImg} source={{ uri: post.creatorPic || uri }} />
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{post.creatorName}</Text>
                <Text style={styles.postTime}>{post.createdAt && getRelativeTime(post.createdAt.toDate())}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.followerButton,
                  {
                    backgroundColor: following.includes(post.userId) ? "#000" : "#01AEF0",
                  },
                ]}
                onPress={() => handleFollowerButtonClick(post.userId)}>
                <Text style={styles.followerButtonText}>
                  {following.includes(post.userId) ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
            <Swiper containerStyle={styles.swiperContainer} activeDotColor="white" showsButtons={false} dotColor="silver" autoplay={true}>
              {Array.isArray(post.media) && post.media.map((selectedMedia, index) => (
                <View key={index}>
                  {selectedMedia.type === "image" && (
                    <Image source={{ uri: selectedMedia.url }} style={styles.postImage} />
                  )}
                  {selectedMedia.type === "video" && (
                    <View>
                      <Video
                        ref={videoRef}
                        source={{ uri: selectedMedia.url }}
                        style={styles.postImage}
                        resizeMode="cover"
                        shouldPlay={false}
                        isLooping
                        onPlaybackStatusUpdate={(status) => {
                          setVideoDuration(status.durationMillis);
                          setCurrentPosition(status.positionMillis);
                        }}
                      />
                      <TouchableOpacity style={styles.playButton} onPress={toggleVideoPlayback}>
                        <MaterialIcons name={isVideoPlaying ? "pause" : "play-arrow"} size={40} color="white" />
                      </TouchableOpacity>
                      <View style={styles.videoControls}>
                        <TouchableOpacity onPress={() => handleSeek(-10)}>
                          <MaterialIcons name="replay-10" size={30} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.videoDuration}>{formatDuration(currentPosition)}</Text>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={1}
                          value={currentPosition / videoDuration}
                          onValueChange={handleSliderChange}
                        />
                        <Text style={styles.videoDuration}>{formatDuration(videoDuration)}</Text>
                        <TouchableOpacity onPress={() => handleSeek(10)}>
                          <MaterialIcons name="forward-10" size={30} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </Swiper>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLikeButtonClick(post.id)}>
              <FontAwesome
                name={post.likes && post.likes.includes(user?.uid) ? "heart" : "heart-o"}
                size={24}
                color={post.likes && post.likes.includes(user?.uid) ? "red" : "black"}
              />
            </TouchableOpacity>
            <Text style={styles.likeCount}>
              {post.likes ? `${post.likes.length} Likes` : '0 Likes'}
            </Text>
            <Text style={styles.postTitle}>{post.title}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddPostScreen")}>
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
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: 'space-between',
    flexDirection: "row",
    paddingHorizontal: 25,
    backgroundColor: "white",
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
  headerText: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  scrollView: {
    width: "100%",
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
  previewImg: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: "gainsboro",
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
  headerInfo: {
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: 'Outfit-Regular',
  },
  postTime: {
    fontSize: 14,
    color: "gray",
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
  followerButton: {
    backgroundColor: "#01AEF0",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: "auto",
    marginRight: 10,
  },
  followerButtonText: {
    color: "white",
    fontFamily: 'Poppins-Regular'
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
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    zIndex: 2,
  },
  videoControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: 'absolute',
    bottom: 20,
    width: '95%',
    right: 10,
  },
  videoDuration: {
    color: "white",
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
});