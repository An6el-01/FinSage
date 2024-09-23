// frontend/components/CryptoPortfolioScreen/PortfolioValue.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PortfolioValue = () => {
  // Placeholder value for the total portfolio
  const totalValue = 15000; // This should be fetched dynamically

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Portfolio Value</Text>
      <Text style={styles.value}>${totalValue.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    color: '#888',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default PortfolioValue;
