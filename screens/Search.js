import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import { database } from "../firebase";
import logo from "../assets/appLogo.png";
import { UserContext } from "../utils/UserContext";
import { Image as OptimizedImage } from "expo-image";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";

const ChatScreen = ({ navigation }) => {
  const { uid, setUid } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleLogout = () => {
    AsyncStorage.removeItem("uid");
    setUid(null);
  };

  useEffect(() => {
    getChatUsers();
  }, []);

  const getChatUsers = async () => {
    try {
      setLoading(true);
      const q = await getDocs(
        query(collection(database, "users"), where("uid", "!=", uid))
      );
      setLoading(false);
      let arry = q.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
      setFilteredUsers(arry);
      setUsers(arry);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSearch = (txt) => {
    setSearchQuery(txt);
    let filterList = users.filter((obj) => {
      return obj?.name?.toLowerCase()?.includes(txt?.toLowerCase());
    });
    setFilteredUsers(filterList);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={{ fontWeight: "700" }}>Chat</Text>
        <TouchableOpacity
          style={styles.but}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <MaterialIcons name={"logout"} size={18} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          style={styles.searchInput}
          onChangeText={handleSearch}
          placeholder="Search users..."
        />
        <Icon name="magnify" style={[styles.searchIcon]} />
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getChatUsers} />
        }
      >
        {filteredUsers?.map((user, idx) => {
          let txt = "";
          const curDate = moment();
          const tim = moment(user.msgTime);
          if (tim.isSame(curDate, "day")) {
            txt = tim.format("hh:mm A");
          } else if (tim.isSame(curDate.subtract(1, "days"), "day")) {
            txt = "Yesterday";
          } else txt = tim.format("DD/MM/YYYY");

          return (
            <View style={styles.row} key={idx}>
              <TouchableOpacity
                style={styles.leftBox}
                onPress={() => {
                  navigation.navigate("SelectedChatScreen", { user, uid });
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={styles.imgBox}>
                    <OptimizedImage
                      contentFit="cover"
                      style={styles.image}
                      source={{
                        uri: "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png",
                      }}
                    />
                  </View>
                  <View>
                    <Text style={styles.brand}>{user.name}</Text>
                    <Text style={styles.package} numberOfLines={2}>
                      {user.email}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.read}>{txt}</Text>
                  <FontAwesome
                    size={15}
                    color="gray"
                    name={user.unread ? "envelope-o" : "envelope-open-o"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  but: {
    width: 35,
    height: 35,
    marginRight: 10,
    borderRadius: 50,
    alignItems: "center",
    backgroundColor: "#009c55",
    justifyContent: "center",
  },
  header: {
    width: "95%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    width: 60,
    height: 60,
  },
  row: {
    width: "90%",
    marginHorizontal: "5%",
    paddingVertical: 15,
    borderBottomColor: "gainsboro",
    borderBottomWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  imgBox: {
    width: 40,
    height: 40,
    shadowColor: "gainsboro",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    borderRadius: 100,
    backgroundColor: "white",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  brand: {
    fontSize: 16,
    marginBottom: 3,
    textTransform: "capitalize",
  },
  package: {
    fontSize: 10,
    color: "gray",
    width: Dimensions.get("window").width * 0.45,
  },
  read: {
    color: "gray",
    marginBottom: 5,
  },

  searchContainer: {
    width: "92%",
    alignSelf: "center",
    position: "relative",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchInput: {
    margin: 3,
    height: 40,
    width: "100%",
    elevation: 4,
    shadowRadius: 3,
    shadowOpacity: 1,
    borderRadius: 100,
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 0 },
  },
  searchIcon: {
    right: 20,
    fontSize: 20,
    color: "#858C94",
    position: "absolute",
  },
});
