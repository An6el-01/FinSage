// frontend/components/HomeScreen/FinancialOverview.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FinancialOverviewProps } from '../../types/types';

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ totalIncome, totalExpenses, savings }) => {
  const formatMoney = (value: number) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Financial Overview</Text>
      <Text style={styles.text}>Total Income: {formatMoney(totalIncome)}</Text>
      <Text style={styles.text}>Total Expenses: {formatMoney(totalExpenses)}</Text>
      <Text style={styles.text}>Net Balance: {formatMoney(savings)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FinancialOverview;
