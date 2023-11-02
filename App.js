import Users from "./screens/Users";
import Signup from "./screens/Signup";
import Profile from "./screens/Profile";
import Login from "./screens/LoginScreen";
import SeachScreen from "./screens/Search";
import ForgetPsw from "./screens/ForgetPsw";
import MessageSceen from "./screens/MessageSceen";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
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
        component={Users}
        options={{
          tabBarIcon: ({ focused }) => {
            let ico = focused ? "chat" : "chat-bubble-outline";
            return <MaterialIcons size={25} color="#009c55" name={ico} />;
          },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SeachScreen}
        options={{
          tabBarIcon: () => (
            <MaterialIcons size={25} name="search" color="#009c55" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: () => (
            <MaterialIcons size={25} name="settings" color="#009c55" />
          ),
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
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Routes />
      </UserProvider>
    </SafeAreaProvider>
  );
}
