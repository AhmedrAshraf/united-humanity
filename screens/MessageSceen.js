import {
  doc,
  where,
  query,
  addDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { db } from "../firebase";
import Lottie from "lottie-react-native";
import React, { useState, useCallback } from "react";
import { ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

const Chat = ({ route, navigation }) => {
  const { user, uid } = route.params;
  const [messages, setMessages] = useState([]);
  const [wordLists, setWordLists] = useState(["bad", "lier", "wrong"]);

  const uri =
    user.profilePic ||
    "https://freepngimg.com/thumb/google/66726-customer-account-google-service-button-search-logo.png";

  useFocusEffect(
    useCallback(() => {
      getBadWords();
      setMessages([]);
      const q = query(
        collection(db, "chat"),
        where(user?.uid, "==", true),
        where(uid, "==", true)
      );
      const unsubscribe = onSnapshot(q, (snap) => {
        let list = snap.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data()?.createdAt.toDate(),
          user: { ...doc.data()?.user, avatar: uri },
        }));
        readMsg();
        list = list.sort((a, b) => b.createdAt - a.createdAt);
        setMessages(list);
      });
      return unsubscribe;
    }, [user?.uid])
  );

  const readMsg = () => {
    updateDoc(doc(db, "users", user?.uid), { [uid]: { unread: false } });
  };

  const getBadWords = () => {
    let id = "mCTYDtmuDJhUDICTC93b";
    getDoc(doc(db, "restrictedWords", id)).then((item) => {
      if (item?.data()?.words?.length) {
        setWordLists(item.data().words);
      }
    });
  };

  // Function to check if any word from the array is present in the sentence
  function containsWordFromArray(sentence, wordArray) {
    for (let i = 0; i < wordArray.length; i++) {
      const word = wordArray[i]?.toLowerCase().trim();
      if (sentence?.toLowerCase().includes(word)) {
        return true; // Return true if any word is found
      }
    }
    return false; // Return false if none of the words are found
  }

  const onSend = useCallback((messages = []) => {
    const result = containsWordFromArray(messages[0].text, wordLists);
    if (result) {
      Alert.alert(
        "Warning",
        "You are using spam word in sentence, user can report your account!"
      );
    } else {
      setMessages((prev) => GiftedChat.append(prev, messages));
      let chatObj = { ...messages[0], [user?.uid]: true, [uid]: true };
      let usr = {
        [`${uid}user`]: true,
        [uid]: { unread: true, startedChat: true, msgTime: Date.now() },
      };
      let currUser = {
        [`${user?.uid}user`]: true,
        [user?.uid]: { unread: true, startedChat: true, msgTime: Date.now() },
      };
      updateDoc(doc(db, "users", user?.uid), usr);
      updateDoc(doc(db, "users", uid), currUser);
      addDoc(collection(db, "chat"), chatObj);
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badge: 1,
          sound: "default",
          body: chatObj.text,
          to: user.token,
          title: "New Message",
        }),
      });
    }
  }, []);

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <MaterialCommunityIcons name="send-circle" style={styles.send} />
      </Send>
    );
  };

  const scrollToBottomComponent = () => {
    let nme = "chevron-double-down";
    return <MaterialCommunityIcons name={nme} size={32} color="#2B6EDC" />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          style={styles.arrow}
          onPress={() => navigation.goBack()}
        />
        <TouchableOpacity
          style={styles.headerRow}
          onPress={() => navigation.navigate("Setting", user)}
        >
          <Image
            source={{ uri }}
            style={{
              width: 40,
              height: 40,
              marginLeft: 16,
              borderRadius: 100,
            }}
          />
          <Text style={styles.headerTitle}>{user.name}</Text>
        </TouchableOpacity>
      </View>
      <GiftedChat
        messages={messages}
        showUserAvatar={false}
        alwaysShowSend={true}
        scrollToBottom={true}
        wrapInSafeArea={false}
        showAvatarForEveryMessage={false}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size={60} color="#2AD7EB" />
          </View>
        )}
        onSend={onSend}
        renderSend={renderSend}
        scrollToBottomComponent={scrollToBottomComponent}
        textInputStyle={{ backgroundColor: "#fff", borderRadius: 20 }}
        renderChatEmpty={() => (
          <View style={styles.chatContainer}>
            <View style={styles.textContainer}>
              <Text style={{ color: "gray", fontSize: 18 }}>
                Hey Let's chat 💬
              </Text>
            </View>
            <View style={styles.lottieContainer}>
              <Lottie
                source={require(`../assets/Lotties/cat.json`)}
                autoPlay
                speed={1}
                loop
                style={styles.lottie}
              />
            </View>
          </View>
        )}
        user={{ _id: uid, avatar: uri }}
      />
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  content: {
    width: "85%",
    marginTop: 10,
    paddingBottom: 12,
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "gainsboro",
  },
  coverImgBox: {
    width: 60,
    height: 60,
    shadowRadius: 2,
    marginRight: 10,
    shadowOpacity: 1,
    borderRadius: 100,
    alignItems: "center",
    shadowColor: "gainsboro",
    justifyContent: "center",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 0 },
  },
  coverImgBoxGradient: {
    width: 60,
    height: 60,
    shadowRadius: 2,
    marginRight: 10,
    shadowOpacity: 1,
    borderRadius: 100,
    alignItems: "center",
    shadowColor: "gainsboro",
    justifyContent: "center",
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 0 },
    overflow: "hidden",
  },
  coverImg: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
  name: {
    fontSize: 20,
    fontWeight: "500",
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerTitle: {
    fontSize: 20,
    marginLeft: 8,
  },
  arrow: {
    fontSize: 30,
    color: "#000",
  },
  headerIconBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#E9FBFD",
  },
  headerIcon: {
    fontSize: 20,
    color: "#78F1FD",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "flex-end",
    transform: [{ rotateX: "180deg" }],
    alignItems: "center",
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",

    marginBottom: 200,
  },
  lottieContainer: {
    alignItems: "center",
  },
  lottie: {
    width: 170,
    height: 170,
  },
  send: {
    marginRight: 10,
    marginBottom: 5,
    fontSize: 32,
    color: "#2B6EDC",
  },
});
