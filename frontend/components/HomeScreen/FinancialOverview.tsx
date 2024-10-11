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

  // Get the number of days in the selected month
  const today = new Date().getDate();

  // Generate dynamic X-axis labels: split into 4 even points, with today's date as the last point
  const xAxisLabels = [
    `${monthsAbrev[selectedMonth]} 1`,
    `${monthsAbrev[selectedMonth]} ${Math.floor(today / 3)}`,
    `${monthsAbrev[selectedMonth]} ${Math.floor((today / 3) * 2)}`,
    `${monthsAbrev[selectedMonth]} ${today}` // Set today's date as the last X-axis label
  ];

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
      <View style={styles.row}>
        <View style={[styles.pill, styles.incomePill]}>
          <Text style={styles.pillText}>Income</Text>
        </View>
        <Text style={styles.text}>{formatMoney(totalIncome)}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.pill, styles.expensePill]}>
          <Text style={styles.pillText}>Expenses</Text>
        </View>
        <Text style={styles.text}>{formatMoney(totalExpenses)}</Text>
      </View>

      {/* Line Chart */}
      <LineChart
        data={{
          labels: xAxisLabels, // Display 4 points across the month with today as the rightmost point
          datasets: [
            {
              data: incomeData,
              color: (opacity = 1) => `rgba(0, 200, 0, ${opacity})`, // Green for income
              strokeWidth: 2,
            },
            {
              data: expensesData,
              color: (opacity = 1) => `rgba(255, 69, 58, ${opacity})`, // Red for expenses
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get('window').width - 60} // Adjust the graph to fit the screen
        height={240}
        chartConfig={{
          backgroundColor: '#f9f9f9',
          backgroundGradientFrom: '#f9f9f9',
          backgroundGradientTo: '#f9f9f9',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 10,
          borderRadius: 16,
        }}
        withInnerLines={false} // Remove inner grid lines
        fromZero={true} // Start graph from zero
        segments={4} // Control the number of Y-axis segments
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
    elevation: 5,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  incomePill: {
    backgroundColor: '#28a745',
  },
  expensePill: {
    backgroundColor: '#dc3545',
  },
  pillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FinancialOverview;
