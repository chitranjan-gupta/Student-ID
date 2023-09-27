import React, { useEffect } from "react";
import { StyleSheet, Button, View, ToastAndroid } from "react-native";

import { useAries } from "../lib/aries";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function Wallet({ navigation }) {
  const { initializeAgent } = useAries();
  useEffect(() => {
    async function call() {
      await initializeAgent();
      console.log("initialized agent");
      ToastAndroid.show('initialized agent', ToastAndroid.LONG);
    }
    call();
  }, []);
  return (
    <View style={styles.container}>
      <Button title="Scan" onPress={() => navigation.navigate("Scanner")} />
    </View>
  );
}
