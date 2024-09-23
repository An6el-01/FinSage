// frontend/components/HomeScreen/RecentTransactions.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecentTransactionProps } from '../../types/types';

const RecentTransactions: React.FC<RecentTransactionProps> = ({ transactions }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Transactions</Text>
      {transactions.slice(0, 5).map((transaction, index) => (
        <View key={index} style={styles.transactionRow}>
          <Text style={styles.transactionText}>
            {transaction.description} - ${transaction.amount.toFixed(2)}
          </Text>
        </View>
      ))}
      {transactions.length > 5 && (
        <Button title="View All Transactions"/>
        // onPress={() => navigation.navigate('Transactions')} />
      )}
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
  transactionRow: {
    marginBottom: 5,
  },
  transactionText: {
    fontSize: 16,
  },
});

export default RecentTransactions;
