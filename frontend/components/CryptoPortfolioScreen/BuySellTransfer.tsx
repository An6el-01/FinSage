// frontend/components/CryptoPortfolioScreen/BuySellTransfer.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const BuySellTransfer = () => {
  return (
    <View style={styles.container}>
      <Button title="Buy Crypto" onPress={() => {/* Implement Buy functionality */}} />
      <Button title="Sell Crypto" onPress={() => {/* Implement Sell functionality */}} />
      <Button title="Transfer Crypto" onPress={() => {/* Implement Transfer functionality */}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default BuySellTransfer;
