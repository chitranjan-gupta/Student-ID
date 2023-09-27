import React from "react";
import { StyleSheet, View, Button } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function Credentials() {
  return (
    <View style={styles.container}>
      <Button title="Credential" />
    </View>
  );
}
