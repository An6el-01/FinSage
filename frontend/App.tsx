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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from './types/navigationTypes';

// Screens
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import Statistics from "./screens/Statistics";
import NewTransaction from "./screens/NewTransaction";
import YearlySummary from "./screens/YearlySummary";
import FinancialGoals from "./screens/FinancialGoals";
import Budgeting from "./screens/Budgeting";
import LogInPage from "./screens/LogInPage";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Define AuthContext with proper types
type AuthContextType = {
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

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
};

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

const MainTabs = () => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === "Home") iconName = focused ? "home" : "home-outline";
        else if (route.name === "Statistics") iconName = focused ? "bar-chart" : "bar-chart-outline";
        else if (route.name === "Settings") iconName = focused ? "settings" : "settings-outline";
        else if (route.name === "NewTransaction") iconName = focused ? "add-circle" : "add-circle-outline";
        return <Ionicons name={iconName as "key"} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text,
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Statistics" component={Statistics} />
    <Tab.Screen name="NewTransaction" component={NewTransaction} options={{ title: 'New Entry' }} />
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator>
);

// Define the state and action types
type State = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
};

type Action = 
  | { type: 'RESTORE_TOKEN'; token: string | null }
  | { type: 'SIGN_IN'; token: string }
  | { type: 'SIGN_OUT' };

// Define the initial state outside useReducer
const initialState: State = {
  isLoading: true,
  isSignout: false,
  userToken: null,
};

const App = () => {
  const [state, dispatch] = React.useReducer((prevState: State, action: Action): State => {
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
  }, initialState);

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('isLoggedIn');
      } catch (e) {
        console.error(e);
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken === 'true' ? 'dummy-auth-token' : null });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: (token: string) => {
        dispatch({ type: 'SIGN_IN', token });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
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
              <Stack.Screen name="LoginPage" component={LogInPage} />
            ) : (
              <Stack.Screen name="MainTabs" component={MainTabs} />
            )}
          </Stack.Navigator>
        </SQLiteProvider>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
export { AuthContext }; // Export AuthContext
