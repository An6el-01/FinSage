import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'; // Correct import
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

interface FinancialOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  currencySymbol: string;
  incomeData: number[];
  expensesData: number[];
  onMonthYearChange: (month: number, year: number) => void;
  selectedMonth: number; // Receive selectedMonth from parent
  selectedYear: number;  // Receive selectedYear from parent
}

const IncomeExpenseGraph: React.FC<FinancialOverviewProps> = ({
  totalIncome,
  totalExpenses,
  currencySymbol,
  incomeData,
  expensesData,
  onMonthYearChange,
  selectedMonth,
  selectedYear
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthsAbrev = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
    'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ];

  const formatMoney = (value: number) => `${currencySymbol}${value.toFixed(2)}`;

  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    onMonthYearChange(newMonth, newYear); // Notify parent component
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onMonthYearChange(newMonth, newYear); // Notify parent component
  };

  const today = new Date().getDate();
  const lastDayOfSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const daysToShow = (selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear())
    ? today
    : lastDayOfSelectedMonth;

  const xAxisLabels = Array.from({ length: daysToShow }, (_, index) => `${monthsAbrev[selectedMonth]} ${index + 1}`);
  const filteredXAxisLabels = xAxisLabels.filter((_, index) => index % Math.ceil(daysToShow / 6) === 0);

  const incomeProjection = Array.from({ length: daysToShow }, (_, day) => (totalIncome / daysToShow) * (day + 1));

  const cumulativeExpenses = expensesData.slice(0, daysToShow).reduce((acc, curr, index) => {
    acc.push((acc[index - 1] || 0) + curr);
    return acc;
  }, [] as number[]);

  return (
    <View style={styles.container}>
      {/* Month and Year navigation */}
      <View style={styles.monthYearContainer}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{months[selectedMonth]} {selectedYear}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Display Income and Expense Overview with Pills */}
      <View style={styles.pillContainer}>
        <View style={styles.pillSection}>
          <View style={[styles.pill, styles.incomePill]}>
            <Text style={styles.pillText}>Income</Text>
          </View>
          <Text style={styles.amountText}>+ {formatMoney(totalIncome)}</Text>
        </View>

        <View style={styles.pillSection}>
          <View style={[styles.pill, styles.expensePill]}>
            <Text style={styles.pillText}>Expenses</Text>
          </View>
          <Text style={styles.amountText}>- {formatMoney(totalExpenses)}</Text>
        </View>
      </View>

      {/* Line Chart */}
      <LineChart
        data={{
          labels: filteredXAxisLabels,
          datasets: [
            {
              data: incomeProjection, // Smooth projection for income
              color: () => `rgba(40, 167, 69, 1)`,  // Brighter green, matches the pill
              strokeWidth: 3,  // Slightly thicker line for clarity
            },
            {
              data: cumulativeExpenses,  // Reflect cumulative daily expenses
              color: () => `rgba(220, 53, 69, 1)`,  // Brighter red, matches the pill
              strokeWidth: 3,  // Consistent thickness
            },
          ],
        }}
        width={Dimensions.get('window').width - 60}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#f5f5f5',
          decimalPlaces: 2,
          color: () => `rgba(0, 0, 0, 0.6)`,
          labelColor: () => `rgba(0, 0, 0, 0.6)`,
          propsForBackgroundLines: {
            strokeDasharray: '0',
            stroke: '#e0e0e0',
          },
          propsForDots: {
            r: '4',
            strokeWidth: '0',
            fill: '#fff',
          },
        }}
        style={{
          marginVertical: 10,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
        bezier
        withDots={false}
        withInnerLines={false}
        fromZero={true}
        segments={6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  navButton: {
    padding: 10,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  pillSection: {
    alignItems: 'center',
  },
  incomePill: {
    backgroundColor: '#28a745',
  },
  expensePill: {
    backgroundColor: '#dc3545',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});

export default IncomeExpenseGraph;
