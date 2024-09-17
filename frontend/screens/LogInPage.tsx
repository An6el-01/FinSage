import * as React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App'; // Correctly import the AuthContext
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite/next'; // Import SQLite context
import bcrypt from 'react-native-bcrypt'; // Import bcrypt for password hashing
import { Users } from '../types/types';

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
      // Query the Users table to find a user with the matching username
      const results = await db.getAllAsync<Users>(
        'SELECT * FROM Users WHERE username = ?',
        [username]
      );

       // Check if the user was found
       if (results.length > 0) {
        const user = results[0]; // Access the first user directly
        
        // Compare the entered password with the stored hashed password
        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        
        if (isPasswordValid) {
          // Store login status and token
          await AsyncStorage.setItem('isLoggedIn', 'true'); // Set the login status
          authContext?.signIn('dummy-auth-token'); // Use signIn function from AuthContext
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
      <Button title="Create An Account" onPress={() => navigation.navigate('SignUpPage')}/>
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
