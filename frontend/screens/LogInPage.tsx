import * as React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App'; // Correctly import the AuthContext
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite/next'; // Import SQLite context
import bcrypt from 'react-native-bcrypt'; // Import bcrypt for password hashing
import { Users } from '../types/types';
import  BottomNavBar  from '../navigation/BottomNavBar';

const LogInPage = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const authContext = React.useContext(AuthContext); // Use AuthContext
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = useSQLiteContext(); // Access SQLite context

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required.');
      return;
    }

    try {
      const results = await db.getAllAsync<Users>(
        'SELECT * FROM Users WHERE username = ?',
        [username]
      );

      if (results.length > 0) {
        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

        if (isPasswordValid) {
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('user_id', String(user.id));

          authContext?.signIn('dummy-auth-token');
          Alert.alert('Success', 'You have successfully logged in!');
        } else {
          Alert.alert('Login Failed', 'Invalid username or password');
        }
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'An error occurred while logging in. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Create An Account" onPress={() => navigation.navigate('SignUpPage')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default LogInPage;
