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
import { auth } from "../firebase";
import * as Device from "expo-device";
import logo from "../assets/appLogo.png";
import { StatusBar } from "expo-status-bar";
import { doc, updateDoc } from "firebase/database";
import { UserContext } from "../utils/UserContext";
import * as Notifications from "expo-notifications";
import { signInWithEmailAndPassword } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useState, useEffect } from "react";
import { ActivityIndicator, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const { setUid } = useContext(UserContext);

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
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "fbc38cbf-12b5-4fb6-bc5f-481900e84d07",
        })
      ).data;
      console.log(token);
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
          await AsyncStorage.setItem("uid", user?.user?.uid);
          setUid(user?.user?.uid);
          if (pushToken) {
            updateDoc(doc(auth, "users", user.user?.uid), { token: pushToken });
          }
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
          <Text style={styles.appName}>Chat Room</Text>
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
              style={[styles.txt, { color: "#009c55", fontWeight: "600" }]}
            >
              Forget Password?
            </Text>
            <Text
              style={styles.txt}
              onPress={() => navigation.navigate("singup")}
            >
              Create account?{" "}
              <Text style={{ color: "#009c55", fontWeight: "600" }}>
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
            labelStyle={{ fontSize: 20, fontWeight: "600" }}
          >
            Sign in
          </Button>
        </View>
        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ActivityIndicator size={40} color="#009c55" />
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
    left: 30,
    zIndex: 7,
    opacity: 0.6,
    fontSize: 20,
    position: "absolute",
  },
  icon: {
    top: -55,
    right: 20,
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
    marginBottom: 30,
    fontWeight: "500",
  },
  appName: {
    fontSize: 24,
    marginBottom: 60,
    fontWeight: "800",
  },
  but: {
    width: "90%",
    marginTop: 10,
    borderRadius: 5,
    paddingVertical: 5,
    backgroundColor: "#009c55",
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
    paddingLeft: 35,
    borderRadius: 5,
    shadowRadius: 3,
    marginBottom: 20,
    fontWeight: "600",
    shadowOpacity: 0.15,
    paddingVertical: 15,
    shadowColor: "#470000",
    borderColor: "gainsboro",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 3 },
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
    opacity: 0.8,
    fontWeight: "600",
  },
});
