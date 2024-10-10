import * as React from "react";
import { SQLiteProvider } from "expo-sqlite/next";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from './types/navigationTypes';
import { checkAndCopyDatabase } from "./Utils/dbUtils";

// Screens
import BottomNavBar from "./navigation/BottomNavBar"; // Import the BottomNavBar
import LogInPage from "./screens/LogInPage";
import SignUpPage from "./screens/SignUpPage";

type AuthContextType = {
  signIn: (token: string) => void;
  signOut: () => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const Stack = createNativeStackNavigator<RootStackParamList>();

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

  // When the app is launched, check if there's a valid user token in AsyncStorage
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        //await checkAndCopyDatabase();
      } catch (e) {
        console.error(e);
      }

      // After fetching the token, restore it in the state
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  // Define the auth context to handle sign in and sign out
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

  // Show a loading screen while checking for token
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
            {/* Redirect to login screen if userToken is null, else show the home screen */}
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
