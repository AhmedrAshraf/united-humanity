import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { UserContext } from "../utils/UserContext";
import * as ImagePicker from "expo-image-picker";
import { database } from "../firebase";

const AddPostScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [isImageSelected, setIsImageSelected] = useState(false);

  const [user, setUser] = useState();
  const { uid, setUid } = useContext(UserContext);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = () => {
    getDoc(doc(database, "users", uid)).then((docData) => {
      setUser(docData.data());
    });
  };

  const uri =
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) {
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Selected image URI:", result.uri);
      setImage(result.uri);
      setIsImageSelected(true);
    }
  };

  const createPost = async () => {
    // Check if title and image are provided
    if (!title && !image) {
      alert("Please provide a title and select an image for your post.");
      return;
    }

    try {
      // Create a new post document in Firestore with an auto-generated ID
      const postCollection = collection(database, "posts");
      const post = {
        title,
        creatorName: user?.name,
        imageUrl: image || null,
        userId: uid, // Link the post to the user who created it
        createdAt: new Date(),
      };

      const newPostRef = await addDoc(postCollection, post);

      // Use the newly generated document ID
      console.log("New Post ID:", newPostRef.id);

      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating the post. Please try again later.");
    }
  };

  console.log("users:", user);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name={"close"} size={22} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>Create Post</Text>
        <TouchableOpacity onPress={createPost}>
          <Text style={{ fontSize: 18, color: "#000" }}>Post</Text>
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
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <MaterialIcons name="add-a-photo" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
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
  },
});
