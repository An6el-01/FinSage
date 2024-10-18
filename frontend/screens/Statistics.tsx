import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { TransactionsCategories, Transactions } from "../types/types";
import { useSQLiteContext } from 'expo-sqlite/next';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import { categoryColors, categoryEmojies } from '../types/constants';
import PieChart from 'react-native-pie-chart';
import Card from "../components/ui/Card";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigationTypes';

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
    paddingBottom: 50,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',  // Use a premium font like Poppins
    color: colors.text,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentMonthText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 5,
  },
  periodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  categoryText: {
    fontSize: 16,
  fontWeight: '600',  // Increase font weight for better readability
  color: colors.text,
  },
  categoryAmount: {
    fontSize: 16,
    marginLeft: 'auto',
    fontWeight: '500',
  },
  netBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  noDataText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  iconButton: {
    padding: 5,
  },
  statsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  pillSection: {
    alignItems: 'center',
    marginLeft: 20,
  },
  pill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    backgroundColor: 'linear-gradient(90deg, #34ebae, #28a745)',  // Gradient for a polished look
  },
  pillText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },  
  incomePill: {
    backgroundColor: '#28a745',  // Green for income
  },
  expensePill: {
    backgroundColor: '#dc3545',  // Red for expense
  },
  amountText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#f5f2f2',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },  
  categoryRowWithColor: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight:  13,
  },
  settingsIconName: {
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  }
});

type GroupedTransactions = {
  [key: string]: {
    amount: number;
    type: string;
  };
};

export default function Statistics() {
  const [data, setData] = React.useState<Transactions[]>([]);
  const [filter, setFilter] = React.useState<string>('Expense');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [categories, setCategories] = React.useState<TransactionsCategories[]>([]);
  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 

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

  const fetchData = async () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime());
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime());

    const result = await db.getAllAsync<Transactions>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setData(result);

    const categoriesResult = await db.getAllAsync<TransactionsCategories>(
      `SELECT * FROM TransactionsCategories;`
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
  const groupedTransactions: GroupedTransactions = filteredData.reduce((acc: GroupedTransactions, transaction: Transactions) => {
    const category = transaction.category_id.toString();
    const categoryName = categories.find(cat => cat.id.toString() === category)?.name || "Unknown";
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        amount: 0,
        type: transaction.type,
      };
    }
    acc[categoryName].amount += transaction.amount;
    return acc;
  }, {});

  const chartData = Object.values(groupedTransactions).map(item => item.amount);
  const chartColors = Object.keys(groupedTransactions).map(categoryName => categoryColors[categoryName] || '#000');

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Card>
        <View style={styles.navigationButtonContainer}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.iconButton}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.currentMonthText}>Statistics for {readableMonth}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.iconButton}>
            <Ionicons name="chevron-forward-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.netBalanceText}>Net Balance: {netBalance < 0 ? '-' : '+'}${Math.abs(netBalance).toFixed(2)}</Text>
        <View style={styles.statsContainer}>
        <View style={styles.pillContainer}>
          <View style={styles.pillSection}>
            <TouchableOpacity style={[styles.pill, styles.expensePill]} onPress={() => setFilter('Expense')}>
              <Text style={styles.pillText}>Expense</Text>
              <Text style={styles.amountText}>- ${totalExpenses.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pillSection}>
            <TouchableOpacity style={[styles.pill, styles.incomePill]} onPress={() => setFilter('Income')}>
              <Text style={styles.pillText}>Income</Text>
              <Text style={styles.amountText}>+ ${totalIncome.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartContainer}>
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
        </View>
        </View>
        <Button title="View Yearly Summary" onPress={() => navigation.navigate('YearlySummary')} />

      </Card>
      
      <Text style={styles.periodTitle}>Categories</Text>
      <Card>
        {Object.keys(groupedTransactions).map(categoryName => {
          const amount = groupedTransactions[categoryName].amount;
          const type = groupedTransactions[categoryName].type;
          const emoji = categoryEmojies[categoryName] || '';
          const backgroundColor = categoryColors[categoryName] || '#f0f0f0';
          
          return (
            <View key={categoryName} style={[styles.categoryRowWithColor, { backgroundColor }]}>
              <Text style={styles.categoryText}>{emoji} {categoryName}</Text>
              <Text style={[styles.categoryAmount, { color:'black' }]}>
                {type === 'Expense' ? '-' : '+'}${amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}
