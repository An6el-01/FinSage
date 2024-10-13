import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';
import { categoryColors, categoryEmojies } from '../../types/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite/next';
import { useGoalDataAccess } from '../../database/BudgetDataAccess';
import { categoryMapping } from '../../types/categoryMapping';

interface TransactionDetailsProps {
  navigation: NavigationProp<RootStackParamList, 'TransactionDetails'>;
  route: RouteProp<RootStackParamList, 'TransactionDetails'>;
}

export default function TransactionDetails({ navigation, route }: TransactionDetailsProps) {
  const { refreshBudget} = useGoalDataAccess();  
  const [ amount, setAmount ] = useState(route.params.amount);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense');
  const [description, setDescription] = useState<string>(''); // Add description state
  const categories = Object.keys(categoryColors); // Simplified category list
  const db = useSQLiteContext(); 

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSpendPress = async () => {
    const storedUserId = await AsyncStorage.getItem('user_id');
    
    if (!storedUserId) {
      Alert.alert('Error', 'User not logged in. Please log in first.');
      return;
    }

    // Validate if necessary fields are filled
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please enter a valid amount and select a category.');
      return;
    }

    // Get the category ID from the mapping
    const selectedCategoryId = categoryMapping[selectedCategory];
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Invalid category selected.');
      return;
    }

    // Prepare the transaction object to be saved
    const transaction = {
      id: 0, // Auto-increment in the database
      user_id: Number(storedUserId), // Change this to the actual user ID
      amount: Number(amount),
      description: description || 'No description', // Default description if none is provided
      category_id: selectedCategoryId, // Use the mapped category_id
      date: date.getTime(), // Convert the selected date to a timestamp
      type: transactionType, // 'Expense' or 'Income'
    };

    try {
      // Insert the transaction into the database
      await db.runAsync(
        `INSERT INTO Transactions (user_id, category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?, ?);`,
        [
          transaction.user_id,
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      
      // Optional: Refresh or update any other parts of your app like budgets
      //await refreshBudget(transaction.category_id);

      // Reset the form and display a success message
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      setTransactionType('Expense');
      setDate(new Date());

      Alert.alert('Success', 'Transaction added successfully');
      navigation.navigate("AllTransactions"); // Optionally navigate back to the previous screen after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
      console.error(error);
    }
};

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header with Amount */}
      <View style={styles.header}>
        <Text style={styles.amountText}>£{amount}</Text>
        <TextInput
          placeholder="Transaction Description"
          value={description}
          onChangeText={setDescription}
          style={styles.descriptionInput} // New input for description
        />
        <TouchableOpacity style={styles.actionButton} onPress={handleSpendPress}>
          <Text style={styles.actionText}>Spend</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <TouchableOpacity style={styles.detailRow} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.rowContent}>
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.rowText}>{date.toDateString()}</Text>
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        )}

        {/* Categories */}
        <Text style={styles.subHeader}>Categories</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, transactionType === 'Expense' && styles.activeFilter]}
            onPress={() => setTransactionType('Expense')}
          >
            <Text style={[styles.filterText, transactionType === 'Expense' && styles.activeFilterText]}>
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, transactionType === 'Income' && styles.activeFilter]}
            onPress={() => setTransactionType('Income')}
          >
            <Text style={[styles.filterText, transactionType === 'Income' && styles.activeFilterText]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          {categories.map((category) => {
            const isExpense = transactionType === 'Expense' && !category.includes('Income');
            const isIncome = transactionType === 'Income' && category.includes('Income');

            if (isExpense || isIncome) {
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryPill,
                    { backgroundColor: categoryColors[category] },
                    selectedCategory === category && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryEmoji}>{categoryEmojies[category]}</Text>
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionInput: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  subHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#2C2C2C',
  },
  activeFilter: {
    backgroundColor: '#28a745',
  },
  filterText: {
    color: '#888888',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
