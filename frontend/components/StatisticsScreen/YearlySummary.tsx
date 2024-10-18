import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite/next';
import { useFocusEffect } from '@react-navigation/native';
import { Transactions, TransactionsCategories, SavingsGoals } from '../../types/types';
import { categoryColors, categoryEmojies } from '../../types/constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

import SavingsGoalsProgress from "../HomeScreen/SavingsGoalsProgress";


const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
  premium: '#283E4A', // Dark blue for premium section
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
  // New premium card styles
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: colors.premium,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
  // New styles for progress bars
  progressBar: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  progress: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#6BCB77',
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight: 13,
  },
  settingsIconName: {
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  },
  // New CTA Button style
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

const getLuminance = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

const getTextColorForBackground = (backgroundColor: string) => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 140 ? '#000' : '#fff';
};

export default function YearlySummary() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [categories, setCategories] = React.useState<TransactionsCategories[]>([]);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [totalIncome, setTotalIncome] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [goals, setGoals] = React.useState<SavingsGoals[]>([]); // Add state for goals

  const fetchData = async () => {
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear + 1, 0, 1).getTime();

    const result = await db.getAllAsync<Transactions>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfYear, endOfYear]
    );

    let totalIncome = 0;
    let totalExpenses = 0;
    

    result.forEach(transaction => {
      const transactionDate = new Date(transaction.date).getDate()-1;

      if (transaction.type === 'Income') {
        totalIncome += transaction.amount;
      }else if (transaction.type === 'Expense') {
        totalExpenses += transaction.amount;
      }
    });

    const categoriesResult = await db.getAllAsync<TransactionsCategories>(
      `SELECT * FROM TransactionsCategories;`
    );
    setCategories(categoriesResult);

    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
  };

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionAsync(async () => {
        await fetchData();
      });
    }, [db, currentYear])
  );

  const mappedGoals = goals.map(goal => ({
    name: goal.name,
    progress: goal.progress,
    target: goal.amount,
    targetDate: new Date(goal.target_date).toISOString(), // Convert target_date to string
  }));

  const aggregateDataByMonth = () => {
    // Existing logic here...
  };

  const aggregateDataByCategory = () => {
    // Existing logic here...
  };

  const showProjectionModal = () => {
    // New logic for opening projection modals
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Financial Overview Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Income</Text>
        <Text style={styles.cardText}>${totalIncome}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Expenses</Text>
        <Text style={styles.cardText}>${totalExpenses}</Text>
      </View>

      {/* Charts */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending Trends</Text>
        {/*<LineChart /* ... */ }
      </View>

      {/* Projection Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Projections</Text>
        <Text style={styles.cardText}>Forecast your future with AI-powered insights.</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('FinancialProjections')} >
          <Text style={styles.ctaButtonText}>Explore Projections</Text>
        </TouchableOpacity>
      </View>

      {/* Savings Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings Goals</Text>
        <View style={styles.progressBar}>
         <SavingsGoalsProgress goals={mappedGoals} />
        </View>
        <Text style={styles.cardText}>60% of your $5,000 goal.</Text>
      </View>

      {/* Insights */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Insights</Text>
        <Text style={styles.cardText}>
          "Increase your monthly savings by $200 to achieve your target faster."
        </Text>
      </View>
    </ScrollView>
  );
}
