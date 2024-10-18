import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

interface FinancialOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  currencySymbol: string;
  incomeData: number[];
  expensesData: number[];
  onMonthYearChange: (month: number, year: number) => void;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  totalIncome,
  totalExpenses,
  currencySymbol,
  incomeData,
  expensesData,
  onMonthYearChange,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthsAbrev = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
    'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ];

  // Format currency
  const formatMoney = (value: number) => `${currencySymbol}${value.toFixed(2)}`;

  // Handle month/year navigation
  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onMonthYearChange(newMonth, newYear);
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onMonthYearChange(newMonth, newYear);
  };

  const today = new Date().getDate();
  const lastDayOfSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Show all days for past months, but limit current month to 'today'
  const daysToShow = (selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear())
    ? today
    : lastDayOfSelectedMonth;

  // X-Axis Labels filtered to show no more than 6 evenly spaced labels
  const xAxisLabels = Array.from({ length: daysToShow }, (_, index) => `${monthsAbrev[selectedMonth]} ${index + 1}`);
  const filteredXAxisLabels = xAxisLabels.filter((_, index) => index % Math.ceil(daysToShow / 6) === 0);

  // Income Linear Projection: Spread total income evenly across the month
  const incomeProjection = Array.from({ length: daysToShow }, (_, day) => (totalIncome / daysToShow) * (day + 1));

  // Expenses reflect daily transaction values
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
          color: () => `rgba(0, 0, 0, 0.6)`,  // Soft black for axes
          labelColor: () => `rgba(0, 0, 0, 0.6)`,  // Muted labels
          propsForBackgroundLines: {
            strokeDasharray: '0',  // Subtle grid
            stroke: '#e0e0e0',
          },
          propsForDots: {
            r: '4',
            strokeWidth: '0',
            fill: '#fff',  // White dots for interactive feel
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
        withDots={false}  // Removed unnecessary dots
        withInnerLines={false}  // Cleaner chart look
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
    elevation: 6,  // Slightly more elevation for premium depth
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,  // More rounded corners
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    backgroundColor: 'linear-gradient(90deg, #28a745, #34ce57)',  // Gradient for a premium look
  },
  pillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,  // Slightly larger font for emphasis
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
    alignItems: 'center',  // Center the text and pill vertically
  },
  incomePill: {
    backgroundColor: '#28a745',  // Green matching the line chart
  },
  expensePill: {
    backgroundColor: '#dc3545',  // Red matching the line chart
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});

export default FinancialOverview;
