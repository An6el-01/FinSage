import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Text, View, StyleSheet, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { RootStackParamList } from './Misc/navigationTypes';

//Screens
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import Statistics from "./screens/Statistics";
import NewTransaction from "./screens/NewTransaction";
import YearlySummary from "./screens/YearlySummary";
import FinancialGoals from "./screens/FinancialGoals";
import Budgeting from "./screens/Budgeting";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const deleteExistingDatabase = async () => {
  const dbName = "mySQLiteDB.db";
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(dbFilePath);
    console.log("Deleted existing database file");
  }
}

const loadDatabase = async () => {
  const dbName = "mySQLiteDB.db";
  const dbAsset = require("./assets/mySQLiteDB.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
    console.log('Database copied from assets.');
  } else {
    console.log('Database already exists, no need to copy.');
  }
};



async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

const StatisticsStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="StatisticsMain" component={Statistics}/>
      <Stack.Screen name="YearlySummary" component={YearlySummary}/> 
    </Stack.Navigator>
  );
}

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="FinancialGoals" component={FinancialGoals} />
      <Stack.Screen name="Budgeting" component={Budgeting} />
    </Stack.Navigator>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [dbLoaded, setDbLoaded] = React.useState<boolean>(false);
 
  React.useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));


  }, []);

  if (!dbLoaded)
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} />
        <Text>Loading Database...</Text>
      </View>
    );

  return (
    <NavigationContainer>
      <React.Suspense
        fallback={
          <View style={styles.container}>
            <ActivityIndicator size={"large"} />
            <Text>Loading Database...</Text>
          </View>
        }
      >
        <SQLiteProvider databaseName="mySQLiteDB.db" useSuspense>
          <Tab.Navigator 
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home"){
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "Statistics"){
                  iconName =  focused ? "bar-chart" : "bar-chart-outline";
                } else if (route.name === "Settings"){
                  iconName =  focused ? "settings" : "settings-outline";
                } else if (route.name === "NewTransaction") {
                  iconName = focused ? "add-circle" : "add-circle-outline";
                }
                return <Ionicons name={iconName as "key"} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text,
            })}
            >
            <Tab.Screen name="Home" component={HomeStack}/>
            <Tab.Screen name="Statistics" component={StatisticsStack} />
            <Tab.Screen name="NewTransaction" component={NewTransaction} options={{ title: 'New Entry' }} />
            <Tab.Screen name="Settings" component={Settings} />
          </Tab.Navigator>
        </SQLiteProvider>        
      </React.Suspense>
    </NavigationContainer>
  );
}
