import * as React from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
});

const FinancialProjections = () => {
 return(
    <View style={styles.container}>
      <Text style={styles.text}>Financial Projections</Text>
    </View>
  );
};

export default FinancialProjections;
