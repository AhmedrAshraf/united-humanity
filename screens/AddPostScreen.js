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
import { database, storage } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../utils/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import Swiper from "react-native-swiper";
import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";

const AddPostScreen = ({ navigation }) => {
  const { uid, user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);

  const uri =
    user?.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return false;
    }
    return true;
  };

  const pickImage = () => {
    setImagePickerVisible(true);
  };
  const handleOverlayPress = () => {
    setImagePickerVisible(false);
  };
  const handleModalOption = async (option) => {
    setImagePickerVisible(false);

    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) {
      return;
    }

    let result;
    if (option === "camera") {
      result = await launchCameraAsync();
    } else if (option === "gallery") {
      result = await launchImageLibraryAsync();
    }
    if (result) {
      setIsImageSelected(true);
      handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (img) => {
    try {
      console.log("🚀 ~ file: AddPostScreen.js:63 ~ handleUpload ~ img:", img)
      setLoading(true)
      let res = await fetch(img);
      let blob = await res.blob();
      console.log("🚀 ~ file: AddPostScreen.js:66 ~ handleUpload ~ blob:", blob)
      let nam = Date.now().toString();
      console.log("🚀 ~ file: AddPostScreen.js:67 ~ handleUpload ~ nam:", nam)
      const storeRef = ref(storage, nam);
      console.log( "🚀 ~ file: AddPostScreen.js:69 ~ handleUpload ~ storeRef:", storeRef)
      await uploadBytes(storeRef, blob);
      const url = await getDownloadURL(storeRef);
      setImage((prevImages) => [...prevImages, url]);
      setLoading(false);
      console.log("🚀 ~ file: AddPostScreen.js:72 ~ .then ~ url:", url);
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!image || image.length === 0) {
      alert("Please select at least one image for your post.");
      return;
    }

    try {
      const postCollection = collection(database, "posts");
        const post = {
          title,
          creatorName: user.name || null,
          username: user.username || null,
          imageUrl: image || null,
          userId: uid,
          creatorPic: user.profilePic || null,
          createdAt: new Date(),
        };

        await addDoc(postCollection, post);
      setTitle("");
      setImage([]);
      setIsImageSelected(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating the post. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name={"close"} size={22} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontFamily: 'Poppins-Medium' }}>Create Post</Text>
        <TouchableOpacity onPress={createPost}>
          <Text style={{ fontSize: 18, color: "#000", fontFamily: 'Poppins-Regular' }}>Post</Text>
        </TouchableOpacity>
      </View>

      <View activeOpacity={0.9} style={styles.content}>
        <Image style={styles.previewImg} source={{ uri }} />
        <Text style={styles.name}>{user?.name || "Loading..."}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="What's on your mind?"
          value={title}
          multiline={true}
          style={styles.postTitleInput}
          onChangeText={(text) => setTitle(text)}
        />
      </View>
      <Swiper
        containerStyle={styles.swiperContainer}
        activeDotColor="white"
        showsButtons={false}
        dotColor="silver"
        autoplay={true}
      >
        {image.map((selectedImage, index) => (
          <Image
            key={index}
            source={{ uri: selectedImage }}
            style={styles.postImage}
          />
        ))}
      </Swiper>
      <View style={styles.addButtonContainer}>
      <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Alert.alert(
              "Choose Image Source",
              "Select the image source for your post",
              [
                {
                  text: "Camera",
                  onPress: () => handleModalOption("camera"),
                },
                {
                  text: "Gallery",
                  onPress: () => handleModalOption("gallery"),
                },
              ],
            );
          }}
        >          
        <MaterialIcons name="add-a-photo" size={22} color="white" />
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

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f5",
  },
  header: {
    width: "95%",
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
    borderRadius: 120,
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
});
