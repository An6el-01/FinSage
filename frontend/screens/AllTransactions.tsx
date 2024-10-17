import * as React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite/next";
import IncomeExpenseGraph from '../components/AllTransactionsScreen/IncomeExpenseGraph';
import TransactionList from '../components/TransactionsList';
import { Transactions } from "../types/types";
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

export default function AllTransactions() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = React.useState<Transactions[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [totalIncome, setTotalIncome] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [incomeData, setIncomeData] = React.useState<number[]>([]);
  const [expensesData, setExpensesData] = React.useState<number[]>([]);
  const [currencySymbol, setCurrencySymbol] = React.useState('$'); // Default to USD
  const [isLoading, setIsLoading] = React.useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Function to fetch transactions and update state
  const fetchTransactions = async (month: number, year: number) => {
    setIsLoading(true);
    
    try {
      const startOfMonth = new Date(year, month, 1).getTime();
      const endOfMonth = new Date(year, month + 1, 0).getTime();
    
      const result = await db.getAllAsync<Transactions>(
        `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
        [startOfMonth, endOfMonth]
      );
    
      setTransactions(result);
    
      let totalIncome = 0;
      let totalExpenses = 0;
    
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const incomeData = Array(daysInMonth).fill(0);
      const expensesData = Array(daysInMonth).fill(0);
    
      result.forEach(transaction => {
        const transactionDate = new Date(transaction.date).getDate() - 1;
    
        if (transaction.type === 'Income') {
          totalIncome += transaction.amount;
          incomeData[transactionDate] += transaction.amount;
        } else if (transaction.type === 'Expense') {
          totalExpenses += transaction.amount;
          expensesData[transactionDate] += transaction.amount;
        }
      });
    
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
      setIncomeData(incomeData);
      setExpensesData(expensesData);
    
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      await db.runAsync(
        `DELETE FROM Transactions WHERE id = ?;`,
        [id]
      );
      Alert.alert("Success", "Transaction deleted successfully.");
      fetchTransactions(selectedMonth, selectedYear); // Refetch transactions to update UI
    } catch (error) {
      Alert.alert("Error", "Failed to delete the transaction.");
    }
  };

  // Handle month/year change from the graph
  const handleMonthYearChange = (newMonth: number, newYear: number) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchTransactions(newMonth, newYear);  // Fetch new transactions for the selected month and year
  };

  React.useEffect(() => {
    fetchTransactions(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

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
        {/* Income and Expense Graph for the selected month */}
        <IncomeExpenseGraph 
           totalIncome={totalIncome}
           totalExpenses={totalExpenses}
           currencySymbol={currencySymbol}
           incomeData={incomeData}     // Pass income data
           expensesData={expensesData} // Pass expenses data
           onMonthYearChange={handleMonthYearChange} // Pass the function to handle month/year changes
           selectedMonth={selectedMonth} // Pass selectedMonth so the graph stays in sync
           selectedYear={selectedYear}   // Pass selectedYear for consistency
        />

        {/* Render all transactions */}
        <View>
          <Text style={styles.transactionsTitle}>Transactions for {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>
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
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  }
});
