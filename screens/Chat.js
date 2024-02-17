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
import { db } from "../firebase";
import { UserContext } from "../utils/UserContext";
import { Image as OptimizedImage } from "expo-image";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { query, where, collection, onSnapshot } from "firebase/firestore";

const ChatScreen = ({ navigation }) => {
  const { user, uid } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);


  const uri =
    user.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useEffect(() => {
    getActiveChats();
  }, []);

  console.log(users)
  const getActiveChats = () => {
    const q = query(
      collection(db, "users"),
      where(`${uid}user`, "==", true)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const arry = snap.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
      setFilteredUsers(arry);
      setUsers(arry);
    });
    return unsubscribe;
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Profile", user)}
        >
          <Image style={styles.profilePic} source={{ uri }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontFamily: 'Poppins-Medium' }}>Chat</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <MaterialIcons name={"settings"} size={26} color="#000" />
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
        refreshControl={<RefreshControl onRefresh={getActiveChats} />}
      >
        {filteredUsers?.map((user, idx) => {
          let txt = "";
          const curDate = moment();
          const tim = moment(user[uid].msgTime);
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
                      source={{ uri: users.profilePic }}
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
                  <View style={{ alignItems: "center" }}>
                    {user[uid]?.unread && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          marginVertical: 5,
                          borderRadius: 35,
                          backgroundColor: "green",
                        }}
                      />
                    )}
                    <FontAwesome
                      size={15}
                      color="gray"
                      name={user[uid].unread ? "envelope-o" : "envelope-open-o"}
                    />
                  </View>
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
    backgroundColor: "#01AEF0",
    justifyContent: "center",
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
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gainsboro",
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
    borderRadius: 10,
  },
  brand: {
    fontSize: 16,
    marginBottom: 3,
    textTransform: "capitalize",
    fontFamily: 'Outfit-Regular',
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  searchInput: {
    margin: 3,
    height: 40,
    width: "90%",
    elevation: 2,
    shadowRadius: 2,
    borderRadius: 4,
    shadowOpacity: 1,
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 1 },
    fontFamily: 'Poppins-Regular'
  },
  searchIcon: {
    right: 20,
    fontSize: 20,
    color: "#858C94",
    position: "absolute",
  },
});
