import * as React from "react";
import { ScrollView, StyleSheet, Text, TextStyle, Platform, View, Dimensions, TouchableOpacity, Button, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Category, Transaction, TransactionsByMonth } from "../types/types";
import { useSQLiteContext } from "expo-sqlite/next";
import Card from "../components/ui/Card";
import PieChart from 'react-native-pie-chart';
import { categoryColors, categoryEmojies } from '../types/constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  periodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pillAmount: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
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

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionAsync(async () => {
        await getData();
      });
    }, [db, currentMonth])
  );

  

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

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1);
      return newMonth;
    });
  };

  // Add this function to handle exporting the database
  async function exportDatabase() {
    const dbPath = `${FileSystem.documentDirectory}SQLite/mySQLiteDB.db`;
    const exportPath = `${FileSystem.documentDirectory}mySQLiteDB_exported.db`;

    await FileSystem.copyAsync({
        from: dbPath,
        to: exportPath,
    });

    console.log('Database copied to:', exportPath);

    // Open the share dialog to share the exported database
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportPath);
    } else {
        console.log("Sharing is not available on this device");
    }
}


  return (
    <ScrollView contentContainerStyle={{ padding: 15, paddingVertical: Platform.OS === 'ios' ? 17 : 17 }}>
      <TransactionSummary
        totalExpenses={transactionsByMonth.totalExpenses}
        totalIncome={transactionsByMonth.totalIncome}
        transactions={transactions}
        categories={categories}
        currentMonth={currentMonth}
        handlePreviousMonth={handlePreviousMonth}
        handleNextMonth={handleNextMonth}
      />
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FinancialGoals')}>
        <Text style={styles.cardText}>Financial Goals</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Budgeting')}>
        <Text style={styles.cardText}>Budgeting</Text>
      </TouchableOpacity>
      {/* Add the button to export the database */}
      <View style={styles.buttonContainer}>
        <Button title="Export Database" onPress={exportDatabase} />
      </View>
    </ScrollView>
  );
}

function TransactionSummary({
  totalIncome,
  totalExpenses,
  transactions,
  categories,
  currentMonth,
  handlePreviousMonth,
  handleNextMonth
}: TransactionsByMonth & { transactions: Transaction[], categories: Category[], currentMonth: Date, handlePreviousMonth: () => void, handleNextMonth: () => void }) {
  const savings = totalIncome - totalExpenses;
  const readablePeriod = currentMonth.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  const getMoneyTextStyle = (value: number): TextStyle => ({
    fontWeight: "bold",
    color: value < 0 ? "#ff4500" : "#2e8b57", // Red for negative, custom green for positive
  });

  const formatMoney = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return `${value < 0 ? "-" : ""}$${absValue}`;
  };

  const data = transactions.reduce((acc: { [key: string]: any }, transaction) => {
    const category = transaction.category_id;
    const categoryName = categories.find(cat => cat.id === category)?.name || "Unknown";
    if (!acc[category]) {
      acc[category] = {
        name: categoryName,
        amount: 0,
        color: categoryColors[category] || categoryColors["18"],
        emoji: categoryEmojies[categoryName] || "",
      };
    }
    acc[category].amount += transaction.amount;
    return acc;
  }, {});

  const chartData = Object.values(data).map(item => item.amount);
  const chartColors = Object.values(data).map(item => item.color);

  return (
    <Card style={styles.container}>
      <Text style={styles.periodTitle}>Summary for {readablePeriod}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Previous Month" onPress={handlePreviousMonth} />
        <Button title="Next Month" onPress={handleNextMonth} />
      </View>
      <Text style={styles.summaryText}>
        Gross Income:{" "}
        <Text style={getMoneyTextStyle(totalIncome)}>
          {formatMoney(totalIncome)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
        Total Expenses:{" "}
        <Text style={getMoneyTextStyle(totalExpenses)}>
          {formatMoney(totalExpenses)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
        Net Balance:{" "}
        <Text style={getMoneyTextStyle(savings)}>{formatMoney(savings)}</Text>
      </Text>
      {chartData.reduce((a, b) => a + b, 0) > 0 ? (
        <PieChart
          widthAndHeight={Dimensions.get('window').width - 170}
          series={chartData}
          sliceColor={chartColors}
          coverRadius={0.8}
          coverFill={colors.background}
        />
      ) : (
        <Text style={styles.noDataText}>No transactions to display</Text>
      )}
      <View style={styles.pillsContainer}>
        {Object.values(data).map((item, index) => (
          <View key={index} style={{ ...styles.pill, backgroundColor: item.color }}>
            <Text style={styles.pillText}>{item.emoji} {item.name}</Text>
            <Text style={styles.pillAmount}>{formatMoney(item.amount)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
