import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecentTransactionProps } from '../../types/types';
import { RootStackParamList } from '../../types/navigationTypes';
import { NavigationProp } from '@react-navigation/native';
import TransactionList from '../TransactionsList';
import { useSQLiteContext } from 'expo-sqlite/next';

const RecentTransactions: React.FC<RecentTransactionProps> = ({ transactions }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = useSQLiteContext();

  // Display only the last 3 transactions
  const recentTransactions = transactions.slice(0, 3);
  
  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      await db.runAsync(
        `DELETE FROM Transactions WHERE id = ?;`,
        [id]
      );
      Alert.alert("Success", "Transaction deleted successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to delete the transaction.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Transactions</Text>
      
      {/* Use TransactionList to render the recent transactions */}
      <TransactionList transactions={recentTransactions} categories={[]} deleteTransaction={deleteTransaction} />

      {/* Button to navigate to all transactions */}
      <Button
        title="View All Transactions"
        onPress={() => navigation.navigate('AllTransactions')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
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
});

export default RecentTransactions;
