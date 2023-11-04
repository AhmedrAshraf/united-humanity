import React, { Component } from "react";
import { Text, View, StyleSheet, SafeAreaView } from "react-native";

export default class Home extends Component {
  render() {
    return (
      <SafeAreaView>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <Text style={{ fontSize: 20, fontWeight: 600 }}>Chat Room</Text>
          <TouchableOpacity
            style={styles.but}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <MaterialIcons name={"logout"} size={18} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.container}>
          <Text> Home textInComponent </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
