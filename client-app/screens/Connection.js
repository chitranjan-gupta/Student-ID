import React, { useEffect, useState } from "react";
import { StyleSheet, View, Button, ToastAndroid } from "react-native";

import { useAries } from "../lib/aries";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

function AcceptInvitation({ url }) {
  const { agent } = useAries();
  const [invitationUrl, setInvitationUrl] = useState("");
  useEffect(() => {
    if (url) {
      setInvitationUrl(url);
      console.log(url);
      console.log(agent.config.label);
      ToastAndroid.show("url", ToastAndroid.LONG);
    }
  }, []);
  return (
    <View style={styles.container}>
      <Button
        title="Accept Invitation"
        onPress={async () => {
          try {
            console.log("Starting connection....");
            const invitation = await agent.oob.parseInvitation(invitationUrl);
            if (!invitation) {
              throw new Error("Could not parse invitation from URL");
            }
            const record = await agent.oob.receiveInvitation(invitation);
            console.log(record);
            //const inv = await agent.oob.receiveInvitationFromUrl(invitationUrl);
            //console.log(inv.connectionRecord.id);
            // await agent.connections.returnWhenIsConnected(
            //   inv.connectionRecord.id
            // );
          } catch (err) {
            console.log(err);
          }
        }}
      />
    </View>
  );
}

export default function Connection({ route, navigation }) {
  const { url } = route.params;
  return <AcceptInvitation url={url} />;
}
