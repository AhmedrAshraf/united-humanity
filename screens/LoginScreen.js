import {
  Text,
  View,
  Modal,
  Image,
  Platform,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import * as Device from "expo-device";
import logo from "../assets/logo.png";
import { StatusBar } from "expo-status-bar";
import { auth, database } from "../firebase";
import { UserContext } from "../utils/UserContext";
import * as Notifications from "expo-notifications";
import { signInWithEmailAndPassword } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";
import { ActivityIndicator, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const { setUid, setUser } = useContext(UserContext);

  const [psw, setPsw] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setPushToken(token));
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

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

  const handleLogin = () => {
    if (email && psw) {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, psw)
        .then(async (user) => {
          setUid(user?.user?.uid);
          setUser(user?.user?.uid);
          let usr = await getDoc(doc(database, "users", user?.user?.uid));
          await AsyncStorage.setItem("uid", user?.user?.uid);
          if (pushToken) {
            updateDoc(doc(auth, "users", user.user?.uid), { token: pushToken });
          }
          let usrr = JSON.stringify({ ...usr, token: pushToken });
          setUser(usrr);
          await AsyncStorage.setItem("user", usrr);
        })
        .catch((err) => {
          alert(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
      alert("Invalid Email & Password");
    }
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
          <Text style={styles.heading}>Sign in to your account</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={email}
              placeholder="Email"
              style={styles.input}
              onChangeText={setEmail}
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
            <MaterialCommunityIcons
              name="email-outline"
              style={styles.inputIcon}
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              value={psw}
              style={styles.input}
              onChangeText={setPsw}
              placeholder="Password"
              selectTextOnFocus={false}
              placeholderTextColor="gray"
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <MaterialCommunityIcons
                name={isPasswordVisible ? "eye" : "eye-off"}
                style={styles.icon}
              />
            </TouchableOpacity>
            <MaterialCommunityIcons
              name="lock-outline"
              style={styles.inputIcon}
            />
          </View>
          <View style={styles.box}>
            <Text
              onPress={() => navigation.navigate("ForgetPsw")}
              style={[styles.txt, { color: "#01AEF0", fontWeight: "600" }]}
            >
              Forget Password?
            </Text>
            <Text
              style={styles.txt}
              onPress={() => navigation.navigate("singup")}
            >
              Create account?{" "}
              <Text style={{ color: "#01AEF0", fontWeight: "600" }}>
                Singup
              </Text>
            </Text>
          </View>
          <Button
            mode="contained"
            loading={loading}
            uppercase={false}
            disabled={loading}
            style={styles.but}
            onPress={handleLogin}
            labelStyle={{ fontSize: 20, fontFamily: "Poppins-Medium" }}
          >
            Sign In
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

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
  },
  inputIcon: {
    top: 15,
    left: 40,
    zIndex: 7,
    opacity: 0.6,
    fontSize: 20,
    position: "absolute",
  },
  icon: {
    top: -55,
    right: 25,
    zIndex: 7,
    opacity: 0.6,
    fontSize: 20,
    position: "absolute",
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
    marginBottom: 40,
    fontFamily: "Poppins-Regular",
  },
  appName: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 60,
    fontFamily: "Poppins-Medium",
  },
  but: {
    width: "90%",
    marginTop: 10,
    borderRadius: 5,
    paddingVertical: 5,
    backgroundColor: "#01AEF0",
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
  input: {
    fontSize: 15,
    elevation: 4,
    width: "100%",
    borderWidth: 1,
    paddingLeft: 50,
    borderRadius: 100,
    shadowRadius: 8,
    marginBottom: 20,
    fontWeight: "600",
    shadowOpacity: 0.15,
    paddingVertical: 15,
    borderColor: "#EBEEF2",
    shadowColor: "#470000",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 3 },
    fontFamily: "Poppins-Medium",
  },
  inputBox: {
    paddingHorizontal: "5%",
    width: Dimensions.get("window").width,
  },
  box: {
    width: "88%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  txt: {
    fontFamily: "Poppins-Regular",
  },
});
