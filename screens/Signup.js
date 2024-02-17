import {
  Text,
  View,
  Image,
  Modal,
  Platform,
  TextInput,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import * as Device from "expo-device";
import logo from "../assets/logo.png";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { UserContext } from "../utils/UserContext";
import * as Notifications from "expo-notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Button } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateAdminScreen = ({ navigation }) => {
  const { setUid, setUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPsw, setShowPsw] = useState(false);
  const [pushToken, setPushToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setPushToken(token));
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "fbc38cbf-12b5-4fb6-bc5f-481900e84d07",
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  const handleSubmit = async () => {
    if (!email || !name || !password) {
      alert("Please fill all the fields");
      return;
    }

    setLoading(true);
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userInfo) => {
        if (userInfo?.user?.uid) {
          let usr = {
            name,
            email,
            username,
            profilePic: "",
            createdAt: Date.now(),
            uid: userInfo.user.uid,
            token: pushToken || "",
          };
          setUser(usr);
          setUid(userInfo.user.uid);
          await AsyncStorage.setItem("user", JSON.stringify(usr));
          await AsyncStorage.setItem("uid", userInfo.user.uid);
          await setDoc(doc(db, "users", userInfo.user.uid), usr);
          setName("");
          setEmail("");
          setPassword("");
          setLoading(false);
          console.log("Admin Successfully Registered!");
        } else {
          setLoading(false);
          alert("User not created");
        }
      })
      .catch((er) => {
        setLoading(false);
        alert(JSON.stringify(er));
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.mainContainer} centerContent>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.appName}>United Humanity</Text>
          <Text style={styles.heading}>Create a new account</Text>
          <View style={Platform.isPad ? styles.ph : styles.inputBox}>
            <Text style={styles.label}>
              Name
              <Text style={{ color: "#DA1414" }}> *</Text>
            </Text>
            <TextInput
              value={name}
              placeholder="Full Name"
              style={styles.input}
              onChangeText={setName}
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
          </View>
          <View style={Platform.isPad ? styles.ph : styles.inputBox}>
            <Text style={styles.label}>
              Email
              <Text style={{ color: "#DA1414" }}> *</Text>
            </Text>
            <TextInput
              value={email}
              placeholder="Email Address"
              style={styles.input}
              onChangeText={setEmail}
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
          </View>
          <View style={Platform.isPad ? styles.ph : styles.inputBox}>
            <Text style={styles.label}>
              Password
              <Text style={{ color: "#DA1414" }}> *</Text>
            </Text>
            <TextInput
              value={password}
              style={styles.input}
              onChangeText={setPassword}
              secureTextEntry={!showPsw}
              placeholder="Password"
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                zIndex: 7,
                bottom: 32,
                right: 40,
              }}
              onPress={() => setShowPsw(!showPsw)}
            >
              <MaterialCommunityIcons
                name={showPsw ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.box}>
            <Text
              style={styles.txt}
              onPress={() => navigation.navigate("login")}
            >
              Already have an account?{" "}
              <Text style={{ color: "#01AEF0", fontWeight: "600" }}>
                Sing in
              </Text>
            </Text>
          </View>
          <Button
            mode="contained"
            uppercase={false}
            disabled={loading}
            style={Platform.isPad ? [styles.but, styles.ph] : styles.but}
            labelStyle={{ fontFamily: "Poppins-Medium" }}
            onPress={handleSubmit}
          >
            Create Account
          </Button>
        </View>

        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ActivityIndicator size={40} color="#01AEF0" />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAdminScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  logo: {
    width: 200,
    height: 150,
  },
  heading: {
    fontSize: 16,
    marginBottom: 30,
    fontFamily: "Poppins-Regular",
  },
  appName: {
    fontSize: 24,
    marginBottom: 60,
    marginTop: 10,
    fontFamily: "Poppins-Medium",
  },
  input: {
    fontSize: 15,
    elevation: 4,
    width: "100%",
    borderWidth: 1,
    shadowRadius: 8,
    marginBottom: 20,
    fontWeight: "600",
    borderRadius: 100,
    shadowOpacity: 0.07,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderColor: "#EBEEF2",
    backgroundColor: "white",
    shadowColor: "#470000",
    shadowOffset: { width: 0, height: 3 },
    fontFamily: "Poppins-Medium",
  },
  inputBox: {
    width: Dimensions.get("window").width,
    paddingHorizontal: "5%",
  },
  ph: {
    width: Dimensions.get("window").width * 0.6,
  },
  label: {
    opacity: 0.8,
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 5,
    color: "#2C3A4B",
    fontFamily: "Poppins-Regular",
  },
  but: {
    width: "90%",
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 3,
    backgroundColor: "#01AEF0",
  },
  continueText: {
    fontSize: 16,
    marginVertical: 20,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  textCombiner: {
    marginVertical: 20,
    flexDirection: "row",
  },
  textFooter: {
    fontSize: 16,
    color: "#858C94",
  },
  mainTextHighligther: {
    fontSize: 16,
    marginTop: -5,
    marginBottom: 5,
    color: "#2AD7EB",
    textAlign: "right",
  },
  textHighligther: {
    fontSize: 16,
    marginLeft: 5,
    color: "#2AD7EB",
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
  dropdown: {
    width: "80%",
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  dropdownOption: {
    paddingVertical: 10,
  },
  adminrow: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    borderWidth: 1,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  button: {
    height: 50,
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "600",
  },
  radioContainer: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 100,
    borderColor: "gray",
    alignItems: "center",
    justifyContent: "center",
  },
  radioBox: {
    width: 9,
    height: 9,
    borderRadius: 100,
    backgroundColor: "lightgray",
  },
  box: {
    width: "88%",
    marginTop: 20,
    alignItems: "flex-end",
  },
  txt: {
    fontFamily: "Poppins-Regular",
  },
});
