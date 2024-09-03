import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Dimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite/next';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import PieChart from 'react-native-pie-chart';
import { Transaction, Category } from '../types/types';
import { categoryColors, categoryEmojies } from '../types/constants';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
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
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center', // Center the chart horizontally
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
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 5,
  },
  pillText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

type AggregatedMonthData = {
  income: number;
  expenses: number;
  netSavings: number;
};

type AggregatedCategoryData = {
  amount: number;
  type: string;
  name: string;
};

const getLuminance = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

const getTextColorForBackground = (backgroundColor: string) => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 140 ? '#000' : '#fff';
};

export default function YearlySummary() {
  const db = useSQLiteContext();
  const [data, setData] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  const fetchData = async () => {
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear + 1, 0, 1).getTime();

    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfYear, endOfYear]
    );
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
    }, [db, currentYear])
  );

  const aggregateDataByMonth = (): AggregatedMonthData[] => {
    const months: AggregatedMonthData[] = Array(12).fill(0).map(() => ({
      income: 0,
      expenses: 0,
      netSavings: 0,
    }));

    data.forEach((transaction) => {
      const date = new Date(transaction.date * 1000);
      const month = date.getMonth();
      if (transaction.type === 'Income') {
        months[month].income += transaction.amount;
      } else if (transaction.type === 'Expense') {
        months[month].expenses += transaction.amount;
      }
      months[month].netSavings = months[month].income - months[month].expenses;
    });

    return months;
  };

  const aggregateDataByCategory = (): Record<string, AggregatedCategoryData> => {
    const categoriesMap: Record<string, AggregatedCategoryData> = {};

    data.forEach((transaction) => {
      const category = transaction.category_id.toString();
      const categoryName = categories.find(cat => cat.id === transaction.category_id)?.name || "Unknown";
      if (!categoriesMap[category]) {
        categoriesMap[category] = { amount: 0, type: transaction.type, name: categoryName };
      }
      categoriesMap[category].amount += transaction.amount;
    });

    return categoriesMap;
  };

  const aggregatedData = aggregateDataByMonth();
  const aggregatedCategories = aggregateDataByCategory();

  const labels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const incomeData = aggregatedData.map(month => month.income);
  const expensesData = aggregatedData.map(month => month.expenses);
  const netSavingsData = aggregatedData.map(month => month.netSavings);

  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpenses = expensesData.reduce((a, b) => a + b, 0);
  const totalNetSavings = netSavingsData.reduce((a, b) => a + b, 0);
  const averageMonthlyIncome = totalIncome / 12;
  const averageMonthlyExpenses = totalExpenses / 12;
  const averageMonthlyNetSavings = totalNetSavings / 12;
  const savingsRate = (totalNetSavings / totalIncome) * 100;

  // Calculate Net Worth
  const netWorth = totalIncome - totalExpenses;

  // Filter out income categories and only include expenses
  const filteredCategories = Object.entries(aggregatedCategories).filter(([, category]) => category.type === 'Expense');

  const categoryLabels = filteredCategories.map(([_, category]) => category.name);
  const categoryData = filteredCategories.map(([_, category]) => category.amount);
  const categoryColorsArray = filteredCategories.map(([category]) => categoryColors[category] || '#000');

  // Sort categories by amount and take the top 5
  const topCategories = filteredCategories
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5);

  const chartData = topCategories.map(([, { amount }]) => amount);
  const chartColors = topCategories.map(([category]) => categoryColors[category] || '#000');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Yearly Summary for {currentYear}</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Total Income</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: incomeData,
              },
            ],
          }}
          width={Dimensions.get('window').width - 30}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Total Expenses</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: expensesData,
              },
            ],
          }}
          width={Dimensions.get('window').width - 30}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Net Savings</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: netSavingsData,
              },
            ],
          }}
          width={Dimensions.get('window').width - 30}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Savings Rate</Text>
        <Text style={styles.text}>{savingsRate.toFixed(2)}%</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Net Worth</Text>
        <Text style={styles.text}>${netWorth.toFixed(2)}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top 5 Spending Categories</Text>
        {chartData.reduce((a, b) => a + b, 0) > 0 ? (
          <PieChart
            widthAndHeight={150}
            series={chartData}
            sliceColor={chartColors}
            coverRadius={0.6}
            coverFill={colors.background}
          />
        ) : (
          <Text style={styles.text}>No transactions to display</Text>
        )}
        <View style={styles.pillContainer}>
          {topCategories.map(([category, { amount, name }]) => {
            const emoji = categoryEmojies[name] || '';
            const backgroundColor = categoryColors[category] || '#000';
            const textColor = getTextColorForBackground(backgroundColor);
            return (
              <View
                key={category}
                style={[
                  styles.pill,
                  { backgroundColor },
                ]}
              >
                <Text style={[styles.pillText, { color: textColor }]}>{emoji} {name}</Text>
                <Text style={[styles.pillText, { color: textColor }]}>${amount.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Averages</Text>
        <Text style={styles.text}>Average Monthly Income: ${averageMonthlyIncome.toFixed(2)}</Text>
        <Text style={styles.text}>Average Monthly Expenses: ${averageMonthlyExpenses.toFixed(2)}</Text>
        <Text style={styles.text}>Average Monthly Net Savings: ${averageMonthlyNetSavings.toFixed(2)}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Summary Statistics</Text>
        <Text style={styles.text}>Highest Income Month: {labels[incomeData.indexOf(Math.max(...incomeData))]} (${Math.max(...incomeData).toFixed(2)})</Text>
        <Text style={styles.text}>Highest Expense Month: {labels[expensesData.indexOf(Math.max(...expensesData))]} (${Math.max(...expensesData).toFixed(2)})</Text>
        <Text style={styles.text}>Best Savings Month: {labels[netSavingsData.indexOf(Math.max(...netSavingsData))]} (${Math.max(...netSavingsData).toFixed(2)})</Text>
      </View>
    </ScrollView>
  );
}
