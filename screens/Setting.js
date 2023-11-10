import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { database } from "../firebase";
import logo from "../assets/appLogo.png";
import { Button } from "react-native-paper";
import { doc, getDoc } from "firebase/firestore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../utils/UserContext";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingScreen = ({ navigation }) => {
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

  const handleLogout = () => {
    setUid(null);
    AsyncStorage.removeItem("uid");
  };

  const uri =
    user?.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          style={styles.arrow}
          onPress={() => navigation.goBack()}
        />
        <Text style={{ fontSize: 20, fontWeight: "600" }}>Setting</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <MaterialIcons name={"logout"} size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.SettingContainer}>
        <View activeOpacity={0.9} style={styles.content}>
          <Image style={styles.previewImg} source={{ uri }} />
        </View>
        <View style={styles.SettingDetail}>
          <Text style={styles.name}>{user?.name || "Loading..."}</Text>
          <Text style={styles.email}>{user?.email || "Loading..."}</Text>
        </View>
      </View>
      <View style={styles.SettingData}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>
            Full Name
            <Text style={{ color: "#DA1414" }}> *</Text>
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
            Email
            <Text style={{ color: "#DA1414" }}> *</Text>
          </Text>
          <TextInput
            editable={false}
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="gray"
            value={user?.email || "----------"}
          />
        </View>
      </View>
      <Button
        icon="logout"
        mode="contained"
        uppercase={false}
        style={styles.but}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </SafeAreaView>
  );
};

export default SettingScreen;

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
  logo: {
    width: 60,
    height: 60,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
  },
  arrow: {
    fontSize: 30,
    color: "#000",
  },
  SettingContainer: {
    width: "100%",
    paddingBottom: 20,
    borderBottomWidth: 1,
    alignContent: "center",
    borderBottomColor: "gainsboro",
    marginTop: 20
  },
  previewImg: {
    width: 90,
    height: 90,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
  },
  content: {
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
  },
  email: {
    fontSize: 16,
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
  SettingDetail: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  SettingData: {
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
});
