import * as React from "react";
import { ScrollView, StyleSheet, Text, Platform, View, TouchableOpacity, Button } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Category, Transaction, TransactionsByMonth } from "../types/types";
import { useSQLiteContext } from "expo-sqlite/next";
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
// import { checkAndCopyDatabase } from '../Utils/dbUtils';

// Import the new components
import FinancialOverview from "../components/HomeScreen/FinancialOverview";
import AiInsights from "../components/HomeScreen/AiInsights";
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
    flex: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
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
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] = React.useState<TransactionsByMonth>({
    totalExpenses: 0,
    totalIncome: 0,
  });
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // React.useEffect(() => {
  //   const updateDatabase = async () => {
  //     await checkAndCopyDatabase();
  //   };
  //   updateDatabase();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionAsync(async () => {
        await getData();
      });
    }, [db, currentMonth])
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

  async function getData() {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime());
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime());

    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setTransactions(result);

    const categoriesResult = await db.getAllAsync<Category>(
      `SELECT * FROM Categories;`
    );
    setCategories(categoriesResult);

    const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM Transactions
      WHERE date >= ? AND date <= ?;
    `,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setTransactionsByMonth(transactionsByMonth[0]);
  }

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Financial Overview Component */}
      <FinancialOverview
        totalIncome={transactionsByMonth.totalIncome}
        totalExpenses={transactionsByMonth.totalExpenses}
        savings={transactionsByMonth.totalIncome - transactionsByMonth.totalExpenses}
      />

      {/* AI Insights Component */}
      <AiInsights />

      {/* Recent Transactions Component */}
      <RecentTransactions transactions={transactions} />

      {/* Savings Goals Progress Component */}
      <SavingsGoalsProgress />

      {/* Buttons for viewing all goals and reports */}
      <View style={styles.buttonContainer}>
        <Button title="View Reports"  onPress={() => navigation.navigate('Statistics')}/> 
      </View>

      {/* Add a button to export the database */}
      <View style={styles.buttonContainer}>
        <Button title="Export Database" onPress={exportDatabase} />
      </View>

    </ScrollView>
  );
}
