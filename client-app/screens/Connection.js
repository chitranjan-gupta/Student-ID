import React, { useEffect, useState } from "react";
import { StyleSheet, View, Button } from "react-native";
import { useAgent, useConnections } from "@aries-framework/react-hooks";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

function AcceptInvitation({ url }) {
  const agent = useAgent();
  const [invitationUrl, setInvitationUrl] = useState("");
  useEffect(() => {
    if (url) {
      setInvitationUrl(url);
    }
  }, []);
  return (
    <View>
      <Button
        title="Accept Invitation"
        onClick={async () => {
          const inv = await agent?.agent.oob.receiveInvitationFromUrl(
            invitationUrl
          );
          await agent.agent?.connections.returnWhenIsConnected(
            inv.connectionRecord.id
          );
        }}
      />
    </View>
  );
}

export default function Connection({ route }) {
  const { url } = route.params;
  const navigation = useNavigation();

  const connections = useConnections();
  return (
    <View style={styles.container}>
      <AcceptInvitation url={url} />
    </View>
  );
}
