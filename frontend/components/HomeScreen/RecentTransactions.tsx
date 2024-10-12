import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecentTransactionProps } from '../../types/types';
import { RootStackParamList } from '../../types/navigationTypes';
import { NavigationProp } from '@react-navigation/native';
import TransactionList from '../TransactionsList';
import { useSQLiteContext } from 'expo-sqlite/next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
        <LinearGradient
          colors={['#007BFF', '#00BFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.viewAllButton}
        >
          <Ionicons name="arrow-forward-circle" size={20} color="white" />
          <Text style={styles.viewAllButtonText}>View All Transactions</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  viewAllButtonText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RecentTransactions;
