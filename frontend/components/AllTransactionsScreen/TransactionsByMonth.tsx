// components/TransactionsByMonth.tsx
import * as React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Transactions } from "../../types/types";
import { format, parseISO } from 'date-fns';

// Helper function to group transactions by month
const groupTransactionsByMonth = (transactions: Transactions[]) => {
  return transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = format(date, 'MMMM yyyy');

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);

    return acc;
  }, {} as Record<string, Transactions[]>);
};

export default function TransactionsByMonth({ transactions }: { transactions: Transactions[] }) {
  const transactionsByMonth = groupTransactionsByMonth(transactions);

  return (
    <View style={styles.container}>
      {Object.keys(transactionsByMonth).map((monthYear) => (
        <View key={monthYear} style={styles.monthContainer}>
          <Text style={styles.monthHeader}>{monthYear}</Text>
          <FlatList
            data={transactionsByMonth[monthYear]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <Text>{item.description}</Text>
                <Text style={{ color: item.type === 'Income' ? 'green' : 'red' }}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            )}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  monthContainer: {
    marginBottom: 15,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
});
