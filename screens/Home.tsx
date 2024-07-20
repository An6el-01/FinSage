import * as React from "react";
import { ScrollView, StyleSheet, Text, TextStyle, Platform, View, Button } from "react-native";
import { Category, Transaction, TransactionsByMonth } from "../types";
import { useSQLiteContext } from "expo-sqlite/next";
import TransactionList from "../components/TransactionsList";
import Card from "../components/ui/Card";
import AddTransaction from "../components/AddTransaction";
import PieChart from 'react-native-pie-chart'; // Import the pie chart library
import { Dimensions } from 'react-native';
import { categoryColors, categoryEmojies } from '../constants'; // Import category colors and emojis

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

export default function Home() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] =
    React.useState<TransactionsByMonth>({
      totalExpenses: 0,
      totalIncome: 0,
    });
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const db = useSQLiteContext();

  React.useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db, currentMonth]);

  async function getData() {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

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

  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await getData();
    });
  }

  async function insertTransaction(transaction: Transaction) {
    db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
      `,
        [
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      await getData();
    });
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
      <AddTransaction insertTransaction={insertTransaction} />
      <View style={styles.transactionList}>
        <Text style={styles.periodTitle}>Transactions</Text>
        <TransactionList
          categories={categories}
          transactions={transactions}
          deleteTransaction={deleteTransaction}
        />
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

  // Function to determine the style based on the value (positive or negative)
  const getMoneyTextStyle = (value: number): TextStyle => ({
    fontWeight: "bold",
    color: value < 0 ? "#ff4500" : "#2e8b57", // Red for negative, custom green for positive
  });

  // Helper function to format monetary values
  const formatMoney = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return `${value < 0 ? "-" : ""}$${absValue}`;
  };

  // Prepare data for the doughnut chart and cards
  const data = transactions.reduce((acc: { [key: string]: any }, transaction) => {
    const category = transaction.category_id;
    const categoryName = categories.find(cat => cat.id === category)?.name || "Unknown";
    if (!acc[category]) {
      acc[category] = {
        name: categoryName,
        amount: 0,
        color: categoryColors[category] || categoryColors["18"], // Use color from constants
        emoji: categoryEmojies[categoryName] || "", // Use emoji from constants
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
      {Object.values(data).map((item, index) => (
        <Card key={index} style={{ ...styles.categoryCard, backgroundColor: item.color }}>
          <Text style={styles.categoryText}>{item.emoji} {item.name}</Text>
          <Text style={styles.categoryAmount}>{formatMoney(item.amount)}</Text>
        </Card>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingBottom: 20,
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
  transactionList: {
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
  categoryCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#fff',
  },
});
