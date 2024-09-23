// frontend/screens/CryptoPortfolio.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PortfolioValue from '../components/CryptoPortfolioScreen/PortfolioValue';
import BuySellTransfer from '../components/CryptoPortfolioScreen/BuySellTransfer';
import CryptoReports from '../components/CryptoPortfolioScreen/CryptoReports';
import AIRecommendations from '../components/CryptoPortfolioScreen/AIRecommendations';

const CryptoPortfolio = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crypto Portfolio</Text>

      {/* Display total portfolio value */}
      <PortfolioValue />

      {/* Buy/Sell/Transfer crypto */}
      <BuySellTransfer />

      {/* Buttons for Crypto Reports and AI Recommendations */}
      <View style={styles.buttonContainer}>
        <Button title="View Performance Report" onPress={() => {/* Navigate to CryptoReports screen */}} />
        <Button title="View AI Recommendations" onPress={() => {/* Navigate to AIRecommendations screen */}} />
      </View>
    </View>
  );
};

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
  }
});

export default CryptoPortfolio;
