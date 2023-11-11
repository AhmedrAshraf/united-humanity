import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { database, storage } from "../firebase";
import { Button } from "react-native-paper";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';

const ProfileDetailScreen = ({ route, navigation }) => {
  const { uid } = route.params;

  const [user, setUser] = useState();
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(database, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser(userData);
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uid, setUser]);

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

    Alert.alert(
      'Choose Image Source',
      'Select the source for your image',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Camera',
          onPress: async () => {
            const cameraResult = await launchCameraAsync();
            if (cameraResult) {
              setIsImageSelected(true);
              handleUpload(cameraResult.assets[0].uri);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const galleryResult = await launchImageLibraryAsync();
            if (galleryResult) {
              setIsImageSelected(true);
              handleUpload(galleryResult.assets[0].uri);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleUpload = async (img) => {
    try {
      console.log("🚀 ~ file: AddPostScreen.js:63 ~ handleUpload ~ img:", img);
      setLoading(true);
      let res = await fetch(img);
      let blob = await res.blob();
      console.log("🚀 ~ file: AddPostScreen.js:66 ~ handleUpload ~ blob:", blob);
      let nam = Date.now().toString();
      console.log("🚀 ~ file: AddPostScreen.js:67 ~ handleUpload ~ nam:", nam);
      const storeRef = ref(storage, nam);
      await uploadBytes(storeRef, blob);
      const url = await getDownloadURL(storeRef);
      setImage(url);
      setLoading(false);
      console.log("🚀 ~ file: AddPostScreen.js:72 ~ .then ~ url:", url);
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  const handleUsernameChange = (newUsername) => {
    setUser((prevUser) => ({ ...prevUser, username: newUsername }));
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      const userDocRef = doc(database, "users", user.uid);
      await updateDoc(userDocRef, {
        username: user.username,
        profilePic: image,
        updatedAt: Date.now(),
      });

      setLoading(false);
      alert("Changes saved successfully!");
      navigation.navigate("Home");
    } catch (err) {
      alert(err);
      setLoading(false);
    }
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
        <TouchableOpacity activeOpacity={0.8}>
          <MaterialIcons name={"logout"} size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.ProfileContainer}>
        <View activeOpacity={0.9} style={styles.content}>
          <Image style={styles.previewImg} source={{ uri: image }} />
          <TouchableOpacity style={styles.editBox} onPress={pickImage}>
            <MaterialIcons name="add-a-photo" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.ProfileData}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>
            Username
            <Text style={{ color: "#DA1414" }}> *</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="gray"
            value={user?.username || "----------"}
            onChangeText={handleUsernameChange}
          />
        </View>
      </View>
      <Button
        icon="content-save"
        mode="contained"
        uppercase={false}
        style={styles.but}
        onPress={saveChanges}
      >
        Save
      </Button>
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  ProfileContainer: {
    width: "100%",
    paddingBottom: 20,
    borderBottomWidth: 1,
    alignContent: "center",
    borderBottomColor: "gainsboro",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImg: {
    width: 120,
    height: 120,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  content: {
    width: "30%",
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  editBox: {
    right: 0,
    bottom: 0,
    top: 130,
    left: 240,
    width: 40,
    height: 40,
    borderRadius: 100,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#62E1EF",
  },
  ProfileData: {
    paddingTop: 20,
  },
  input: {
    fontSize: 15,
    elevation: 4,
    width: "100%",
    marginTop: -5,
    borderWidth: 1,
    shadowRadius: 8,
    marginBottom: 10,
    fontWeight: "600",
    borderRadius: 100,
    shadowOpacity: 0.07,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderColor: "#EBEEF2",
    shadowColor: "#470000",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    opacity: 0.8,
    fontSize: 15,
    marginLeft: 20,
    marginBottom: 10,
    color: "#2C3A4B",
    fontWeight: "700",
  },
  inputBox: {
    width: Dimensions.get("window").width,
    paddingHorizontal: "5%",
    marginTop: 5,
  },
  but: {
    bottom: 50,
    width: "90%",
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 3,
    alignSelf: "center",
    position: "absolute",
    backgroundColor: "#01AEF0",
  },
  editBox: {
    width: 40,
    height: 40,
    borderRadius: 100,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#62E1EF",
    bottom: 5,
    right: 5,
  },
});
