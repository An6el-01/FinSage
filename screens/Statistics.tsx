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
  }
});

export default function Statistics() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [filter, setFilter] = React.useState<string>('Expense');
  const db = useSQLiteContext();

  const fetchData = async () => {
    const result = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions ORDER BY date DESC;`
    );
    setData(result);
  };

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionAsync(async () => {
        await fetchData();
      });
    }, [db])
  );

  const filteredData = filter
    ? data.filter(transaction => transaction.type === filter)
    : data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Statistics Page</Text>
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
