import { StyleSheet, Button, View } from "react-native";
import { initializeClient } from "../lib/agent";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default function Wallet(){
    async function get(){
        try{
            const steward = await initializeClient();
            
        }catch(err){
            console.error(err)
        }
    }
    return <View style={styles.container}>
        <Button title={"Connect"} onPress={get}/>
    </View>
}