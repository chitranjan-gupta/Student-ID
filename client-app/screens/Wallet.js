import React, { useEffect } from "react"
import { StyleSheet, Button, View } from "react-native";
import { useNavigation } from '@react-navigation/native';

import { useAries } from "../lib/aries"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default function Wallet() {
    const navigation = useNavigation();
    const { initializeAgent } = useAries();
    useEffect(() => {
        async function call(){
            await initializeAgent()
            console.log("initialized agent");
        }
        call()
    },[])
    return <View style={styles.container}>
        <Button title='Scan' onPress={() => navigation.navigate("Scanner")} />
    </View>
}