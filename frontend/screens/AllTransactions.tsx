import * as React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite/next";
import TransactionsByMonth from '../components/AllTransactionsScreen/TransactionsByMonth';
import IncomeExpenseGraph from '../components/AllTransactionsScreen/IncomeExpenseGraph';
import TransactionList from '../components/TransactionsList'; // Import TransactionList component
import { Transactions } from "../types/types";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

export default function AllTransactions() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = React.useState<Transactions[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Fetch transactions whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

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

  const fetchTransactions = async () => {
    setIsLoading(true);
    const result = await db.getAllAsync<Transactions>(
      `SELECT * FROM Transactions ORDER BY date DESC;`
    );
    setTransactions(result);
    setIsLoading(false);
  };

  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      await db.runAsync(
        `DELETE FROM Transactions WHERE id = ?;`,
        [id]
      );
      Alert.alert("Success", "Transaction deleted successfully.");
      fetchTransactions(); // Refetch the transactions to update the list after deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete the transaction.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Render the Transactions grouped by month */}
        <IncomeExpenseGraph transactions={transactions} />      
        {/* Render all transactions using TransactionList */}
        <TransactionList
          transactions={transactions}
          categories={[]}  // Pass categories if you have them
          deleteTransaction={deleteTransaction} // Handle transaction deletion
        />
      </ScrollView>
      
      {/* Add Circular Plus Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('NewTransactionInput')} // Navigate to new input screen
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight:  13,
  },
  settingsIconName: {
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
