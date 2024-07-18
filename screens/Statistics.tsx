import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button } from 'react-native';
import { Category, Transaction, TransactionsByMonth } from "../types";
import { useSQLiteContext } from 'expo-sqlite/next';
import { useFocusEffect } from '@react-navigation/native';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
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
  }
});

export default function Statistics() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [filter, setFilter] = React.useState<string>('Expense');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const db = useSQLiteContext();

  const fetchData = async () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setData(result);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.currentMonthText}>Statistics for {readableMonth}</Text>
      <View style={styles.navigationButtonContainer}>
        <Button title="Previous Month" onPress={handlePreviousMonth} />
        <Button title="Next Month" onPress={handleNextMonth} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Expense"
          onPress={() => setFilter('Expense')}
          color={filter === 'Expense' ? colors.primary : colors.secondary}
        />
        <Button
          title="Income"
          onPress={() => setFilter('Income')}
          color={filter === 'Income' ? colors.primary : colors.secondary}
        />
      </View>
      {filteredData.map((item, index) => (
        <View key={index} style={styles.text}>
          <Text>Transaction ID: {item.id}</Text>
          <Text>Amount: {item.amount}</Text>
          <Text>Date: {new Date(item.date * 1000).toLocaleDateString()}</Text>
          <Text>Description: {item.description}</Text>
          <Text>Type: {item.type}</Text>
          <Text>Category: {item.category_id}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
