import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import PortfolioValue from '../components/CryptoPortfolioScreen/PortfolioValue';
import BuySellTransfer from '../components/CryptoPortfolioScreen/BuySellTransfer';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { RootStackParamList } from '../types/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight: 13,
  },
  settingsIconName:{
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  }
});


const CryptoPortfolio = () => {
const db = useSQLiteContext();
const navigation = useNavigation<NavigationProp<RootStackParamList>>();

React.useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity style={styles.settingsIcon} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings-outline" size={24} color="black" />
        <Text style={styles.settingsIconName}>Settings</Text>
      </TouchableOpacity>
    ),
  });
}, [navigation]);

  return (
    <View style={styles.container}>

      {/* Display total portfolio value */}
      <PortfolioValue />

      {/* Buy/Sell/Transfer crypto */}
      <BuySellTransfer />

      {/* Buttons for Crypto Reports and AI Recommendations */}
      <View style={styles.buttonContainer}>
        <Button title="View Performance Report" onPress={() => navigation.navigate('CryptoReports')} />
        <Button title="View AI Recommendations" onPress={() => navigation.navigate('CryptoAIRecommendations')} />
      </View>
    </View>
  );
};


export default CryptoPortfolio;
