import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Connection from "./screens/Connection";
import Scanner from "./screens/Scanner";
import Wallet from "./screens/Wallet";
import Home from "./screens/Home";
import { AriesProvider } from "./lib/aries";

const Tab = createBottomTabNavigator();

function WalletTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Login" component={Wallet} />
      <Tab.Screen name="Scanner" component={Scanner} />
      <Tab.Screen
        name="Connection"
        component={Connection}
        initialParams={{ url: "hello" }}
      />
    </Tab.Navigator>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Wallet" component={WalletTabs} />
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <AriesProvider>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </AriesProvider>
  );
};
