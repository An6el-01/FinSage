import * as React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite/next'; // Assuming you're using expo-sqlite
import bcrypt from 'react-native-bcrypt'; // Correct bcrypt library for React Native
import { RootStackParamList } from '../types/navigationTypes';
import { Users } from '../types/types';

const SignUpPage = () => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = useSQLiteContext();

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      // Hash the password before saving
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      // Corrected use of execAsync
      const createUser = async (users: Users) => {
        await db.withTransactionAsync(async () => {
          await db.runAsync(
            `INSERT INTO Users (username, email, password_hash, created_at, updated_at, subscription_plan, is_premium) VALUES (?,?,?,?,?,?,?)`,
            [
                users.username,
                users.email,
                users.password_hash,
                users.created_at,
                users.updated_at,
                users.subscription_plan,
                users.is_premium
            ]
          )  
        })
      }

      Alert.alert('Success', 'Account created successfully.');
      navigation.navigate('LoginPage'); // Navigate back to login page
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <TouchableOpacity onPress={() => navigation.navigate('LoginPage')}>
        <Text style={{ color: 'blue', marginTop: 20, textAlign: 'center' }}>
          Already have an account? Log In
        </Text>
      </TouchableOpacity>
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

export default SignUpPage;
