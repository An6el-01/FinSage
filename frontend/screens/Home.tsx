import * as React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Transactions, SavingsGoals, Budgets, TransactionsCategories } from "../types/types";
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
import SavingsGoalsProgress from "../components/HomeScreen/SavingsGoalsProgress";
import BudgetsHomeComponent from "../components/HomeScreen/BudgetsHomeComponent";

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
    backgroundColor: '#f0f0f5',  // Slightly muted background color
  },
  netWorthContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netWorthTitle: {
    fontSize: 28,  // Larger font for a more premium feel
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  netWorthAmount: {
    fontSize: 40,  // Larger and bolder for impact
    fontWeight: 'bold',
    color: '#28a745',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,  // Slightly increased shadow for depth
  },
  negativeNetWorthAmount: {
    color: '#dc3545',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
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
  const [goals, setGoals] = React.useState<SavingsGoals[]>([]); // Add state for goals
  const [budgets, setBudgets] = React.useState<Budgets[]>([]); // Add state for goals
  const [categories, setCategories] = React.useState<TransactionsCategories[]>([]);


  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      db.withTransactionAsync(async () => {
        await getRecentTransactionsData();
        await getYearlyData(currentMonth, currentYear); // Pass month and year correctly here
        await calculateNetWorth(); // Calculate net worth across all transactions
        await loadGoals();
        await loadBudgets();
        await loadCategories();
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
  
    // Adjust the data arrays to accommodate each day in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const incomeData = Array(daysInMonth).fill(0);
    const expensesData = Array(daysInMonth).fill(0);
  
    result.forEach(transaction => {
      const transactionDate = new Date(transaction.date).getDate() - 1; // Day of the month
  
      if (transaction.type === 'Income') {
        totalIncome += transaction.amount;
        incomeData[transactionDate] += transaction.amount; // Add to corresponding day
      } else if (transaction.type === 'Expense') {
        totalExpenses += transaction.amount;
        expensesData[transactionDate] += transaction.amount; // Add to corresponding day
      }
    });
  
    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setIncomeData(incomeData);
    setExpensesData(expensesData);
  };

  const calculateNetWorth = async () => {
    const result = await db.getAllAsync<Transactions>(
      'SELECT * FROM Transactions ORDER BY date DESC;'  // Fetch all transactions
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    result.forEach(transaction => {
      if (transaction.type === 'Income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'Expense') {
        totalExpenses += transaction.amount;
      }
    });

    const netWorth = totalIncome - totalExpenses;
    setNetBalance(netWorth);  // Update net balance state
  };

  const loadGoals = async () => {
    const result = await db.getAllAsync<SavingsGoals>(
      'SELECT * FROM SavingsGoals WHERE favorite = ?;',
      [1]
    );
    setGoals(result);
  };

  const mappedGoals = goals.map(goal => ({
    name: goal.name,
    progress: goal.progress,
    target: goal.amount,
    targetDate: new Date(goal.target_date).toISOString(), // Convert target_date to string
  }));
  
  const loadBudgets = async () => {
    const result = await db.getAllAsync<Budgets>(
      'SELECT * FROM Budgets WHERE favorite = ?;',
      [1]
    );
    setBudgets(result);
  };

  const mappedBudgets = budgets.map(budget => ({
    category: budget.category_id,
    spent: budget.spent,
    amount: budget.amount,
  }));

  const loadCategories = async () => {
    const result = await db.getAllAsync<TransactionsCategories>('SELECT * FROM TransactionsCategories;');
    setCategories(result);
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Net Worth Display */}
      <View style={styles.netWorthContainer}>
        <Text style={styles.netWorthTitle}>Net Worth</Text>
        <Text style={[
          styles.netWorthAmount, 
          netBalance < 0 && styles.negativeNetWorthAmount  // Change color if negative
        ]}>
          {currencySymbol}{netBalance.toFixed(2)}
        </Text>
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
      <SavingsGoalsProgress goals={mappedGoals} />

      {/* Budgets Component */}
      <BudgetsHomeComponent budgets={mappedBudgets} categories={categories}/>

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
