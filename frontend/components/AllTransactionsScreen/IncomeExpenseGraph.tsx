// components/IncomeExpenseGraph.tsx
import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Transactions } from "../../types/types";
import { format, getMonth } from 'date-fns';

export default function IncomeExpenseGraph({ transactions }: { transactions: Transactions[] }) {
  const incomeData = new Array(12).fill(0);
  const expenseData = new Array(12).fill(0);

  transactions.forEach((transaction) => {
    const month = getMonth(new Date(transaction.date));
    if (transaction.type === 'Income') {
      incomeData[month] += transaction.amount;
    } else {
      expenseData[month] += transaction.amount;
    }
  });

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ],
          datasets: [
            {
              data: incomeData,
              color: () => 'green', // Line color for income
              strokeWidth: 2,
            },
            {
              data: expenseData,
              color: () => 'red', // Line color for expenses
              strokeWidth: 2,
            }
          ],
          legend: ['Income', 'Expenses'], // Labels for lines
        }}
        width={Dimensions.get('window').width - 30}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#F5F5F5',
          backgroundGradientFrom: '#F5F5F5',
          backgroundGradientTo: '#F5F5F5',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
