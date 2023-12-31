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
  KeyboardAvoidingView,
} from "react-native";
import { auth } from "../firebase";
import React, { useState } from "react";
import logo from "../assets/logo.png";
import { StatusBar } from "expo-status-bar";
import { sendPasswordResetEmail } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Button } from "react-native-paper";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (email) {
      setLoading(true);
      sendPasswordResetEmail(auth, email)
        .then(async () => {
          setLoading(false);
          alert("Password Resset Email Sent Successfully!");
        })
        .catch((err) => {
          setLoading(false);
          alert(err.message);
        });
    } else {
      setLoading(false);
      alert("Please enter valid email address!");
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
          <Text style={styles.heading}>Resset your account</Text>
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

          <View style={styles.box}>
            <Text
              onPress={() => navigation.navigate("login")}
              style={[styles.txt, { color: "#01AEF0", fontWeight: "600" }]}
            >
              Login
            </Text>
          </View>
          <Button
            mode="contained"
            loading={loading}
            uppercase={false}
            disabled={loading}
            style={styles.but}
            onPress={handleLogin}
            labelStyle={{ fontSize: 20, fontFamily: 'Poppins-Medium' }}
          >
            Reset
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
    fontWeight: "500",
    fontFamily: 'Poppins-Regular'
  },
  appName: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 60,
    fontFamily: 'Poppins-Medium'
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
    fontFamily: 'Poppins-Medium'
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
    fontFamily: 'Poppins-Regular'
  },
});
