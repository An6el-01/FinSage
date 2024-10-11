import * as React from "react";
import { ScrollView, StyleSheet, Text, Platform, View, TouchableOpacity, Button } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Transactions, TransactionsByMonth } from "../types/types";
import { useSQLiteContext } from "expo-sqlite/next";
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

// Import the new components
import FinancialOverview from "../components/HomeScreen/FinancialOverview";
import AiInsights from "../components/HomeScreen/BudgetsHomeComponent";
import RecentTransactions from "../components/HomeScreen/RecentTransactions";
import SavingsGoalsProgress from "../components/HomeScreen/SavingsGoalProgress";

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight: 13,
  },
  settingsIconName: {
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  }
});

export default function Home() {
  const [recentTransactions, setRecentTransactions] = React.useState<Transactions[]>([]);
  const [yearlyTransactions, setYearlyTransaction] = React.useState<Transactions[]>([]);
  const [totalIncome, setTotalIncome] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [netBalance, setNetBalance] = React.useState(0);
  const [currencySymbol, setCurrencySymbol] = React.useState('$'); // Default to USD
  const [incomeData, setIncomeData] = React.useState<number[]>([]);
  const [expensesData, setExpensesData] = React.useState<number[]>([]);

  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      db.withTransactionAsync(async () => {
        await getRecentTransactionsData();
        await getYearlyData(currentMonth, currentYear); // Pass month and year correctly here
      });
    }, [db])
  );

  React.useEffect(() => {
    setCurrencySymbol('$');
  });

  async function getRecentTransactionsData() {
    // Fetch recent transactions for the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime());
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime());

    const result = await db.getAllAsync<Transactions>(
      'SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;',
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setRecentTransactions(result);
  }

  const getYearlyData = async (month: number, year: number) => {
    const startOfMonth = new Date(year, month, 1).getTime();
    const endOfMonth = new Date(year, month + 1, 0).getTime();

    const result = await db.getAllAsync<Transactions>(
      'SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;',
      [startOfMonth, endOfMonth]
    );
    setYearlyTransaction(result);

    let totalIncome = 0;
    let totalExpenses = 0;

    const incomeData = Array(4).fill(0); // 3 data points for 15 days
    const expensesData = Array(4).fill(0);

    result.forEach(transaction => {
      const transactionDate = new Date(transaction.date).getTime();
      const intervalIndex = Math.floor((transactionDate - startOfMonth) / (15 * 24 * 60 * 60 * 1000)); // 15-day interval

      if (transaction.type === 'Income') {
        totalIncome += transaction.amount;
        if (intervalIndex < 4) incomeData[intervalIndex] += transaction.amount;
      } else if (transaction.type === 'Expense') {
        totalExpenses += transaction.amount;
        if (intervalIndex < 4) expensesData[intervalIndex] += transaction.amount;
      }
    });

    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setIncomeData(incomeData);
    setExpensesData(expensesData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.text}>Net Worth</Text>
        <Text style={styles.text}>{netBalance}</Text>
      </View>

      {/* Financial Overview Component */}
      <FinancialOverview
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currencySymbol={currencySymbol}
        incomeData={incomeData}     // Pass income data
        expensesData={expensesData} // Pass expenses data
        onMonthYearChange={getYearlyData}
      />

      {/* Recent Transactions Component */}
      <RecentTransactions transactions={recentTransactions} />

      {/* Savings Goals Progress Component */}
      <SavingsGoalsProgress />

      {/* Budgets Component */}
      <AiInsights />

      {/* Buttons for viewing all goals and reports */}
      <View style={styles.buttonContainer}>
        <Button title="View Reports" onPress={() => navigation.navigate('Statistics')} />
      </View>

      {/* Add a button to export the database */}
      <View style={styles.buttonContainer}>
        <Button title="Export Database" onPress={exportDatabase} />
      </View>
    </ScrollView>
  );
}

  // Handle database export
  async function exportDatabase() {
    const dbPath = `${FileSystem.documentDirectory}SQLite/mySQLiteDB.db`;
    const exportPath = `${FileSystem.documentDirectory}mySQLiteDB_exported.db`;

    await FileSystem.copyAsync({
      from: dbPath,
      to: exportPath,
    });

    console.log('Database copied to:', exportPath);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(exportPath);
    } else {
      console.log("Sharing is not available on this device");
    }
  }