import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const data = {
  Income: [
    { category: 'Salary', amount: 5000 },
    { category: 'Investments', amount: 2000 },
  ],
  Expenses: [
    { category: 'Rent', amount: 1000 },
    { category: 'Groceries', amount: 500 },
  ],
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Statistics = () => {
  const [selectedType, setSelectedType] = useState<'Income' | 'Expenses'>('Income');
  const [month, setMonth] = useState(new Date().getMonth()); // Current month index (0-11)

  const toggleType = (type: 'Income' | 'Expenses') => {
    setSelectedType(type);
  };

  const renderItem = ({ item }: { item: { category: string; amount: number } }) => (
    <View style={styles.item}>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.amount}>${item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleBar}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'Income' && styles.selectedButton]}
          onPress={() => toggleType('Income')}
        >
          <Text style={styles.toggleText}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === 'Expenses' && styles.selectedButton]}
          onPress={() => toggleType('Expenses')}
        >
          <Text style={styles.toggleText}>Expenses</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data[selectedType]}
        renderItem={renderItem}
        keyExtractor={(item) => item.category}
        style={styles.list}
      />
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={() => setMonth((prev) => (prev === 0 ? 11 : prev - 1))}>
          <Text style={styles.monthButton}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthNames[month]}</Text>
        <TouchableOpacity onPress={() => setMonth((prev) => (prev === 11 ? 0 : prev + 1))}>
          <Text style={styles.monthButton}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  toggleBar: { flexDirection: 'row', marginBottom: 16 },
  toggleButton: { flex: 1, padding: 16, alignItems: 'center' },
  selectedButton: { backgroundColor: '#ddd' },
  toggleText: { fontSize: 16 },
  list: { flex: 1 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  category: { fontSize: 16 },
  amount: { fontSize: 16 },
  monthNavigator: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  monthButton: { fontSize: 16 },
  monthText: { fontSize: 16 },
});

export default Statistics;
