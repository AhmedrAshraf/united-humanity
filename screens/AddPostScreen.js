import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  Image,
  Modal,
  Alert,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Video } from 'expo-av';
import { db, storage } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../utils/UserContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import Swiper from "react-native-swiper";
import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";
import Slider from '@react-native-community/slider';

const AddPostScreen = ({ navigation }) => {
  const videoRef = useRef(null);
  const { uid, user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMediaSelected, setIsMediaSelected] = useState(false);
  const [isMediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const uri = user?.profilePic || "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return false;
    }
    return true;
  };

  const pickMedia = async (mediaType) => {
    setMediaPickerVisible(false);
  
    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) return;
  
    const result = await (mediaType === "camera"
      ? launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All })
      : launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All }));
  
    if (result && !result.canceled) {
      setIsMediaSelected(true);
      handleUpload(result.assets[0].uri);
    }
  };  

  const handleUpload = async (mediaUri) => {
    try {
      setLoading(true);
  
      const res = await fetch(mediaUri);
      const blob = await res.blob();
      const nam = Date.now().toString();
      const storeRef = ref(storage, nam);
  
      await uploadBytes(storeRef, blob);
      const url = await getDownloadURL(storeRef);
  
      const fileType = mediaUri.split('.').pop();
      const type = fileType === 'mp4' ? 'video' : 'image';
  
      setMedia((prevMedia) => [...prevMedia, { type, url }]);
    } catch (err) {
      console.error("Error handling upload:", err);
      alert("Error handling upload. Please try again later.");
    } finally {
      setLoading(false);
    }
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

  const createPost = async () => {
    if (!media || media.length === 0) {
      alert("Please select at least one image for your post.");
      return;
    }
  
    if (!title.trim()) {
      alert("Please enter a title for your post.");
      return;
    }
  
    try {
      const postCollection = collection(db, "posts");
      const post = {
        title,
        creatorName: user.name || null,
        username: user.username || null,
        media: media || null,
        userId: uid,
        creatorPic: user.profilePic || null,
        createdAt: new Date(),
      };
  
      await addDoc(postCollection, post);
      setTitle("");
      setMedia([]);
      setIsMediaSelected(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating the post. Please try again later.");
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Post</Text>
        <TouchableOpacity onPress={createPost}>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* User Information Section */}
      <View activeOpacity={0.9} style={styles.content}>
        <Image style={styles.previewImg} source={{ uri }} />
        <Text style={styles.name}>{user?.name || "Loading..."}</Text>
      </View>

      {/* Post Title Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="What's on your mind?"
          value={title}
          multiline={true}
          style={styles.postTitleInput}
          onChangeText={(text) => setTitle(text)}
        />
      </View>

      {/* Media Swiper Section */}
      <Swiper
        containerStyle={styles.swiperContainer}
        activeDotColor="white"
        showsButtons={false}
        dotColor="silver"
        autoplay={true}
      >
        {media.map((selectedMedia, index) => (
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

      {/* Add Media Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Alert.alert(
              "Choose Image Source",
              "Select the image source for your post",
              [
                { text: "Camera", onPress: () => pickMedia("camera") },
                { text: "Gallery", onPress: () => pickMedia("gallery") },
              ],
            );
          }}
        >
          <MaterialIcons name="add-a-photo" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f5",
  },
  header: {
    width: "100%",
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: "row",
    paddingHorizontal: 25,
    backgroundColor: "#f1f2f5",
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
  postImg: {
    width: 300,
    height: 300,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 60,
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
  previewImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  content: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 26,
    marginLeft: 10,
    fontFamily: 'Outfit-Regular',
  },
  inputContainer: {
    margin: 10,
  },
  postTitleInput: {
    width: "100%",
    fontSize: 22,
    color: "#000",
    flexWrap: "wrap",
    overflow: "visible",
    fontFamily: 'Poppins-Regular',
  },
  postImage: {
    height: 340,
    width: "95%",
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: "center",
    backgroundColor: "#f1f2f5",
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
  imgOptionModal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 120,
  },
  modalOptionContainer: {
    width: "80%",
    padding: 5,
    elevation: 5,
    shadowRadius: 4,
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowColor: "#000",
    alignItems: "center",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 2 },
  },
  modalOption: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "gainsboro",
  },
  modalOptionText: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  postText:{
    fontSize: 18,
    color: "#000",
    fontFamily: 'Poppins-Regular',
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

export default AddPostScreen;