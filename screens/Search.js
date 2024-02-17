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
import { UserContext } from "../utils/UserContext";
import { Image as OptimizedImage } from "expo-image";
import React, { useContext, useState } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const ChatScreen = ({ navigation }) => {
  const { user, uid, followingList } = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(followingList || []);

  const uri =
    user?.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  const getUserProfilePic = (user) => {
    return (
      user?.profilePic ||
      "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png"
    );
  };

  const handleFollowerButtonClick = () => {};

  const handleSearch = (txt) => {
    setSearchQuery(txt);
    let filterList = followingList.filter((obj) => {
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
        <Text style={{ fontSize: 20, fontFamily: "Poppins-Medium" }}>
          Search
        </Text>
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
        <MaterialCommunityIcons name="magnify" style={[styles.searchIcon]} />
      </View>
      <ScrollView refreshControl={<RefreshControl />}>
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
                      source={{ uri: getUserProfilePic(user) }}
                    />
                  </View>
                  <View>
                    <Text style={styles.brand}>{user.name}</Text>
                    <Text style={styles.package} numberOfLines={2}>
                      {user.username}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.read}>{txt}</Text>
                  <TouchableOpacity
                    style={[
                      styles.followerButton,
                      {
                        backgroundColor: followingList.includes(uid)
                          ? "#000"
                          : "#01AEF0",
                      },
                    ]}
                    onPress={() => handleFollowerButtonClick(uid)}
                  >
                    <Text style={styles.followerButtonText}>
                      {followingList.includes(uid) ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
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
  header: {
    width: "100%",
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Outfit-Regular",
  },
  package: {
    fontSize: 10,
    color: "gray",
    width: Dimensions.get("window").width * 0.45,
    fontFamily: "Poppins-Regular",
  },
  read: {
    color: "gray",
    marginBottom: 5,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Regular",
  },
  searchIcon: {
    right: 20,
    fontSize: 20,
    color: "#858C94",
    position: "absolute",
  },
  followerButton: {
    backgroundColor: "#01AEF0",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: "auto",
    marginRight: 10,
  },
  followerButtonText: {
    color: "white",
    fontFamily: "Poppins-Regular",
  },
});
