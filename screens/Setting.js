import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  Modal,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserContext } from "../utils/UserContext";
import { database, storage } from "../firebase";
import * as ImagePicker from "expo-image-picker";

const SettingScreen = ({ navigation }) => {
  const [user, setUser] = useState();
  const { uid, setUid } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [isImageSelected, setIsImageSelected] = useState();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const userDoc = await getDoc(doc(database, "users", uid));
      setUser(userDoc.data());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    setUid(null);
    AsyncStorage.removeItem("uid");
  };

  const uri = image || user?.profilePic || "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return false;
    }
    return true;
  };

  const handleModalOption = async (option) => {

    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      let result;
      if (option === "camera") result = await launchCameraAsync();
      else if (option === "gallery") result = await launchImageLibraryAsync();

      if (result) {
        setIsImageSelected(true);
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error handling image option:", error);
    }
  };

  const handleUpload = async (img) => {
    setLoading(true);
    try {
      let res = await fetch(img);
      let blob = await res.blob();
      let nam = Date.now().toString();
      const storeRef = ref(storage, nam);
      await uploadBytes(storeRef, blob);
      setLoading(false);
      const url = await getDownloadURL(storeRef);
      setImage(url);
    } catch (err) {
      alert(err);
    } finally {
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
      setUser((prevUser) => ({ ...prevUser, username: user.username, profilePic: image }));
      navigation.navigate("Home");
    } catch (err) {
      console.error("Error saving changes:", err);
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
        <Text style={styles.headerTitle}>Setting</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <MaterialIcons name={"logout"} size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.settingContainer}>
        <View activeOpacity={0.9} style={styles.content}>
          <Image style={styles.previewImg} source={{ uri }} />
          <TouchableOpacity
            style={styles.editBox}
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
                ]
              );
            }}
          >
            <MaterialIcons name="edit" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingData}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>
            Full Name<Text style={{ color: "#DA1414" }}> *</Text>
          </Text>
          <TextInput
            editable={false}
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="gray"
            value={user?.name || "----------"}
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>
            Username<Text style={{ color: "#DA1414" }}> *</Text>
          </Text>
          <TextInput
            editable={false}
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="gray"
            onChange={handleUsernameChange}
            value={user?.username || "----------"}
          />
        </View>
      </View>

      <Button
        icon="logout"
        mode="contained"
        uppercase={false}
        style={styles.button}
        onPress={saveChanges}
      >
        Save Changes
      </Button>
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

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
    fontFamily: 'Poppins-Medium'
  },
  arrow: {
    fontSize: 30,
    color: "#000",
  },
  settingContainer: {
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
    borderRadius: 10,
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
    bottom: 0,
    left: 80,
    width: 40,
    height: 40,
    borderRadius: 100,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#01AEF0",
  },
  settingData: {
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
    fontFamily: 'Poppins-Medium'
  },
  inputBox: {
    width: Dimensions.get("window").width,
    paddingHorizontal: "5%",
    marginTop: 5,
    fontFamily: 'Outfit-Regular'
  },
  button: {
    bottom: 50,
    width: "90%",
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 3,
    alignSelf: "center",
    position: "absolute",
    backgroundColor: "#01AEF0",
    fontFamily: 'Poppins-Medium'
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