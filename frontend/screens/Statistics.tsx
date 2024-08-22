import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Category, Transaction } from "../Misc/types";
import { useSQLiteContext } from 'expo-sqlite/next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { categoryColors, categoryEmojies } from '../Misc/constants'; // Import category colors and emojis
import PieChart from 'react-native-pie-chart';
import Card from "../components/ui/Card";
import { RootStackParamList } from '../Misc/navigationTypes';
import { fetchTransactionData, preprocessData } from '../Utils/dataProcessing';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 50, // Ensure there's enough space for the content to scroll
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCard: {
    backgroundColor: '#FF6347', // Tomato color for expenses
  },
  incomeCard: {
    backgroundColor: '#5F9EA0', // CadetBlue color for income
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardAmount: {
    fontSize: 18,
    color: '#fff',
  },
  navigationButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  currentMonthText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  periodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  categoryText: {
    fontSize: 18,
    color: colors.text,
    marginLeft: 10,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  netBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  noDataText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
});

type GroupedTransactions = {
  [key: string]: {
    amount: number;
    type: string;
  };
};

export default function Statistics() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [filter, setFilter] = React.useState<string>('Expense');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [categories, setCategories] = React.useState<Category[]>([]);
  const db = useSQLiteContext();
  const navigation = useNavigation<any>(); 

  const fetchData = async () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime());
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime());

    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    console.log("Transactions fetched in Statistics.tsx:", result); // Debugging log
    setData(result);

    const categoriesResult = await db.getAllAsync<Category>(
      `SELECT * FROM Categories;`
    );
    setCategories(categoriesResult);
};


  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionAsync(async () => {
        await fetchData();
      });
    }, [db, currentMonth])
  );

  const filteredData = filter
    ? data.filter(transaction => transaction.type === filter)
    : data;

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

  const readableMonth = currentMonth.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  const totalIncome = data.filter(transaction => transaction.type === 'Income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = data.filter(transaction => transaction.type === 'Expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Group transactions by category
  const groupedTransactions: GroupedTransactions = filteredData.reduce((acc: GroupedTransactions, transaction: Transaction) => {
    const category = transaction.category_id.toString();
    if (!acc[category]) {
      acc[category] = {
        amount: 0,
        type: transaction.type,
      };
    }
    acc[category].amount += transaction.amount;
    return acc;
  }, {});

  const chartData = Object.values(groupedTransactions).map(item => item.amount);
  const chartColors = Object.keys(groupedTransactions).map(categoryId => categoryColors[categoryId] || '#000');

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.currentMonthText}>Statistics for {readableMonth}</Text>
        <Text style={styles.netBalanceText}>Net Balance: {netBalance < 0 ? '-' : '+'}${Math.abs(netBalance).toFixed(2)}</Text>
        <View style={styles.navigationButtonContainer}>
          <Button title="Previous Month" onPress={handlePreviousMonth} />
          <Button title="Next Month" onPress={handleNextMonth} />
        </View>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, styles.expenseCard]} onPress={() => setFilter('Expense')}>
            <Text style={styles.cardText}>Expense</Text>
            <Text style={styles.cardAmount}>- ${totalExpenses.toFixed(2)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.incomeCard]} onPress={() => setFilter('Income')}>
            <Text style={styles.cardText}>Income</Text>
            <Text style={styles.cardAmount}>+ ${totalIncome.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
        {chartData.reduce((a, b) => a + b, 0) > 0 ? (
          <PieChart
            widthAndHeight={150}
            series={chartData}
            sliceColor={chartColors}
            coverRadius={0.6}
            coverFill={colors.background}
          />
        ) : (
          <Text style={styles.noDataText}>No transactions to display</Text>
        )}
      </Card>
      <Text style={styles.periodTitle}>Categories</Text>
      <Card>
        {Object.keys(groupedTransactions).map(categoryId => {
          const amount = groupedTransactions[categoryId].amount;
          const type = groupedTransactions[categoryId].type;
          const categoryName = categories.find(cat => cat.id.toString() === categoryId)?.name || "Unknown";
          const emoji = categoryEmojies[categoryName] || '';
          return (
            <View key={categoryId} style={styles.categoryRow}>
              <Text style={styles.categoryText}>{emoji} {categoryName}</Text>
              <Text style={[styles.categoryAmount, { color: type === 'Expense' ? '#ff4500' : '#2e8b57' }]}>
                {type === 'Expense' ? '-' : '+'}${amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </Card>
      
      <Button title="View Yearly Summary" onPress={() => navigation.navigate('YearlySummary')} />
    </ScrollView>
  );
}
