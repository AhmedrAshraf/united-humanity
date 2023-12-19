import * as Font from 'expo-font';
import Home from "./screens/Home";
import Users from "./screens/Chat";
import Signup from "./screens/Signup";
import Setting from "./screens/Setting";
import Profile from "./screens/Profile";
import Login from "./screens/LoginScreen";
import SeachScreen from "./screens/Search";
import ForgetPsw from "./screens/ForgetPsw";
import MessageSceen from "./screens/MessageSceen";
import AddPostScreen from "./screens/AddPostScreen";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileDetailScreen from "./screens/ProfileDetailScreen";
import UserProvider, { UserContext } from "./utils/UserContext";
import { View, ActivityIndicator, Vibration } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppStack = createStackNavigator();

const AuthStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="login" component={Login} />
    <AppStack.Screen name="singup" component={Signup} />
    <AppStack.Screen name="ForgetPsw" component={ForgetPsw} />
  </AppStack.Navigator>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const TabStack = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, tabBarShowLabel: false }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: () => (
            <MaterialIcons size={26} name="home" color="#000" />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Users}
        options={{
          tabBarIcon: ({ focused }) => {
            let ico = focused ? "chat" : "chat-bubble-outline";
            return <MaterialIcons size={26} color="#000" name={ico} />;
          },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SeachScreen}
        options={{
          tabBarIcon: () => (
            <MaterialIcons size={26} name="search" color="#000" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => {
            let ico = focused ? "person" : "person-outline";
            return <MaterialIcons size={26} color="#000" name={ico} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export const DrawerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="SelectedChatScreen" component={MessageSceen} />
      <Stack.Screen name="ProfileDetailScreen" component={ProfileDetailScreen} />
      <Stack.Screen name="AddPostScreen" component={AddPostScreen} />
      <Stack.Screen name="Setting" component={Setting} />
    </Stack.Navigator>
  );
};

function Routes() {
  const listner = useRef(null);
  const { uid, setUid } = useContext(UserContext);
  const [laoding, setLoading] = useState(true);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    listner.current = Notifications.addNotificationReceivedListener(() => {
      Vibration.vibrate();
    });

    return () => Notifications.removeNotificationSubscription(listner.current);
  }, []);

  const getUsers = async () => {
    let id = await AsyncStorage.getItem("uid");
    if (id) setUid(id);
    setLoading(false);
  };

  if (laoding) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={40} color="green" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!!uid ? <DrawerStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  async function loadFonts() {
    await Font.loadAsync({
      'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
      'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
      'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
    });
    setFontsLoaded(true);
  }

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={40} color="green" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Routes />
      </UserProvider>
    </SafeAreaProvider>
  );
}
