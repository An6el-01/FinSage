// import * as React from "react";
// import { SQLiteProvider } from "expo-sqlite/next";
// import { ActivityIndicator, Text, View, StyleSheet, Platform, TouchableOpacity } from "react-native";
// import * as FileSystem from "expo-file-system";
// import { Asset } from "expo-asset";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { RootStackParamList } from './types/navigationTypes';

// // Screens
// import Home from "./screens/Home";
// import Settings from "./screens/Settings";
// import Statistics from "./screens/Statistics";
// import Transactions from "./screens/Transactions";
// import YearlySummary from "./screens/YearlySummary";
// import FinancialGoals from "./screens/SavingsGoals";
// import Budgeting from "./screens/Budgets";
// import LogInPage from "./screens/LogInPage";
// import SignUpPage from "./screens/SignUpPage";

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator<RootStackParamList>();

// // Define AuthContext with proper types
// type AuthContextType = {
//   signIn: (token: string) => void;
//   signOut: () => void;
// };

// const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// const colors = {
//   primary: '#FCB900',
//   secondary: '#F9A800',
//   text: '#212121',
//   background: '#F5F5F5',
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
// });

// const registerForPushNotificationsAsync = async () => {
//   let token;

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     try {
//       const projectId =
//         Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//       if (!projectId) {
//         throw new Error('Project ID not found');
//       }
//       token = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(token);
//     } catch (e) {
//       console.error(e);
//     }
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   return token;
// };

// const deleteExistingDatabase = async () => {
//   const dbName = "mySQLiteDB.db";
//   const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

//   const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
//   if (fileInfo.exists) {
//     await FileSystem.deleteAsync(dbFilePath);
//     console.log("Deleted existing database file");
//   }
// };

// const loadDatabase = async () => {
//   const dbName = "mySQLiteDB.db";
//   const dbAsset = require("./assets/mySQLiteDB.db");
//   const dbUri = Asset.fromModule(dbAsset).uri;
//   const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

//   const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
//   if (!fileInfo.exists) {
//     await FileSystem.makeDirectoryAsync(
//       `${FileSystem.documentDirectory}SQLite`,
//       { intermediates: true }
//     );
//     await FileSystem.downloadAsync(dbUri, dbFilePath);
//     console.log('Datbase copied from assets.');}
//     else{
//       console.log('Database already exists, no need to copy.');
//     }
//   };
// const HomeStack = createNativeStackNavigator<RootStackParamList>();
// const StatsStack = createNativeStackNavigator<RootStackParamList>();
// const UserStack = createNativeStackNavigator<RootStackParamList>();
 
// const UserStackNavigator = () => {
//   return(
//     <UserStack.Navigator
//       screenOptions={{
//         headerShown: true, // Set to true to show the header
//         headerStyle: { backgroundColor: colors.primary }, // Optional: Customize header style
//         headerTintColor: '#fff', // Optional: Customize header text color
//         headerTitleStyle: { fontWeight: 'bold' }, // Optional: Customize title style
//       }}
//     >
//       <UserStack.Screen name="LoginPage" component={LogInPage} />
//       <UserStack.Screen
//       name="SignUpPage" 
//       component={SignUpPage} 
//       options={({ navigation }) => ({
//         title: 'Go Back',
//         headerLeft: () => (
//           <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
//             <Ionicons name="arrow-back" size={24} color="#fff" />
//           </TouchableOpacity>
//         ),
//       })} 
//       />
//     </UserStack.Navigator>
//   )
// }

// const HomeStackNavigator = () => {
//   return (
//     <HomeStack.Navigator
//       screenOptions={{
//         headerShown: true, // Set to true to show the header
//         headerStyle: { backgroundColor: colors.primary }, // Optional: Customize header style
//         headerTintColor: '#fff', // Optional: Customize header text color
//         headerTitleStyle: { fontWeight: 'bold' }, // Optional: Customize title style
//       }}
//     >
//       <HomeStack.Screen name="HomeMain" component={Home} options={{ title: 'Welcome Back!' }} />
//       <HomeStack.Screen 
//         name="SavingsGoals" 
//         component={FinancialGoals} 
//         options={({ navigation }) => ({
//           title: 'Go Back',
//           headerLeft: () => (
//             <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
//               <Ionicons name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           ),
//         })} 
//       />
//       <HomeStack.Screen 
//         name="Budgeting" 
//         component={Budgeting} 
//         options={({ navigation }) => ({
//           title: 'Go Back',
//           headerLeft: () => (
//             <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
//               <Ionicons name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           ),
//         })} 
//       />
//     </HomeStack.Navigator>
//   );
// };

// const StatisticsNavigator = () => {
//   return (
//   <StatsStack.Navigator
//   screenOptions={{
//     headerShown: true, // Set to true to show the header
//     headerStyle: { backgroundColor: colors.primary }, // Optional: Customize header style
//     headerTintColor: '#fff', // Optional: Customize header text color
//     headerTitleStyle: { fontWeight: 'bold' }, // Optional: Customize title style
//   }}
//   >
//     <StatsStack.Screen name="StatisticsMain" component={Statistics} options={{ headerShown: false }}/>
//     <StatsStack.Screen
//      name="YearlySummary" 
//      component={YearlySummary} 
//      options={({ navigation }) => ({
//        title: 'Go Back',
//        headerLeft: () => (
//          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
//            <Ionicons name="arrow-back" size={24} color="#fff" />
//          </TouchableOpacity>
//        ),
//      })} 
//     />
//   </StatsStack.Navigator>
//   )
// }


// const MainTabs = () => (
//   <Tab.Navigator 
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ focused, color, size }) => {
//         let iconName;
//         if (route.name === "HomeStack") iconName = focused ? "home" : "home-outline";
//         else if (route.name === "StatsStack") iconName = focused ? "bar-chart" : "bar-chart-outline";
//         else if (route.name === "Settings") iconName = focused ? "settings" : "settings-outline";
//         else if (route.name === "Transactions") iconName = focused ? "add-circle" : "add-circle-outline";
//         return <Ionicons name={iconName as "key"} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: colors.primary,
//       tabBarInactiveTintColor: colors.text,
//     })}
//   >
//     <Tab.Screen name="HomeStack" component={HomeStackNavigator} options={{ title: 'Home'}} />
//     <Tab.Screen name="StatsStack" component={StatisticsNavigator} options= {{ title: 'Statistics'}} />
//     <Tab.Screen name="Transactions" component={Transactions} options={{ title: 'Transactions' }} />
//     <Tab.Screen name="Settings" component={Settings} />
//   </Tab.Navigator>
// );

// // Define the state and action types
// type State = {
//   isLoading: boolean;
//   isSignout: boolean;
//   userToken: string | null;
// };

// type Action = 
//   | { type: 'RESTORE_TOKEN'; token: string | null }
//   | { type: 'SIGN_IN'; token: string }
//   | { type: 'SIGN_OUT' };

// // Define the initial state outside useReducer
// const initialState: State = {
//   isLoading: true,
//   isSignout: false,
//   userToken: null,
// };

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });
// const App = () => {
//   const [state, dispatch] = React.useReducer((prevState: State, action: Action): State => {
//     switch (action.type) {
//       case 'RESTORE_TOKEN':
//         return {
//           ...prevState,
//           userToken: action.token,
//           isLoading: false,
//         };
//       case 'SIGN_IN':
//         return {
//           ...prevState,
//           isSignout: false,
//           userToken: action.token,
//         };
//       case 'SIGN_OUT':
//         return {
//           ...prevState,
//           isSignout: true,
//           userToken: null,
//         };
//       default:
//         return prevState;
//     }
//   }, {
//     isLoading: true,
//     isSignout: false,
//     userToken: null,
//   });

//   // Speed up initialization by splitting into smaller tasks
//   React.useEffect(() => {
//     const bootstrapAsync = async () => {
//       // Parallelize loading and token restoration for faster startup
//       const loadAsyncTasks = async () => {
//         await Promise.all([loadDatabase(), registerForPushNotificationsAsync()]);
//       };

//       loadAsyncTasks().catch(console.error);

//       let userToken;
//       try {
//         userToken = await AsyncStorage.getItem('isLoggedIn');
//       } catch (e) {
//         console.error(e);
//       }

//       dispatch({ type: 'RESTORE_TOKEN', token: userToken === 'true' ? 'dummy-auth-token' : null });
//     };

//     bootstrapAsync();
//   }, []);

//   const authContext = React.useMemo(
//     () => ({
//       signIn: (token: string) => {
//         dispatch({ type: 'SIGN_IN', token });
//       },
//       signOut: () => dispatch({ type: 'SIGN_OUT' }),
//     }),
//     []
//   );

//   if (state.isLoading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" />
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider value={authContext}>
//       <NavigationContainer>
//         <SQLiteProvider databaseName="mySQLiteDB.db">
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             {state.userToken == null ? (
//               <Stack.Screen name="UserStack" component={UserStackNavigator} />
//             ) : (
//               <Stack.Screen name="MainTabs" component={MainTabs} />
//             )}
//           </Stack.Navigator>
//         </SQLiteProvider>
//       </NavigationContainer>
//     </AuthContext.Provider>
//   );
// };

// export default App;
// export { AuthContext };

import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from './types/navigationTypes';
import { checkAndCopyDatabase } from "./Utils/dbUtils";

// Screens
import BottomNavBar from "./navigation/BottomNavBar"; // Import the BottomNavBar
import LogInPage from "./screens/LogInPage";
import SignUpPage from "./screens/SignUpPage";


type AuthContextType = {
  signIn: (token: string) => void;
  signOut: () =>  void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



const App = () => {
  const [state, dispatch] = React.useReducer((prevState: any, action: any) => {
    switch (action.type) {
      case 'RESTORE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'SIGN_IN':
        return {
          ...prevState,
          isSignout: false,
          userToken: action.token,
        };
      case 'SIGN_OUT':
        return {
          ...prevState,
          isSignout: true,
          userToken: null,
        };
      default:
        return prevState;
    }
  }, {
    isLoading: true,
    isSignout: false,
    userToken: null,
  });

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
         // await checkAndCopyDatabase();
      } catch (e) {
        console.error(e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (token: string) => {
        await AsyncStorage.setItem('userToken', token);
        dispatch({ type: 'SIGN_IN', token });
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken');
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    []
  );

  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <SQLiteProvider databaseName="mySQLiteDB.db">
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {state.userToken == null ? (
              <>
                <Stack.Screen name="LoginPage" component={LogInPage} />
                <Stack.Screen name="SignUpPage" component={SignUpPage} />
              </>
            ) : (
              <Stack.Screen name="HomeMain" component={BottomNavBar} />
              
            )}
          </Stack.Navigator>
        </SQLiteProvider>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
