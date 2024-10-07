import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Button, Alert } from 'react-native';
import CustomSlider from './CustomSlider';
import { TransactionsCategories } from '../../types/types';

const colors = {
  primary: "#FCB900",
  secondary: "#F9A800",
  text: "#212121",
  background: "#F5F5F5",
  cardBackground: "#FFFFFF",
  buttonText: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedPill: {
    backgroundColor: colors.secondary,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

interface AddBudgetProps {
  categories: TransactionsCategories[];
  onAddBudget: (category: string, type: 'weekly' | 'monthly', amount: number) => void;
}

const AddBudget: React.FC<AddBudgetProps> = ({ categories, onAddBudget }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetType, setBudgetType] = useState<'weekly' | 'monthly'>('monthly');
  const [amount, setAmount] = useState<number>(0);

  const handleAddBudget = () => {
    if (selectedCategory && amount > 0) { // Ensure valid amount
      onAddBudget(selectedCategory, budgetType, amount);
      setSelectedCategory(null);
      setAmount(0);
      Alert.alert("Success", "Budget added successfully!"); // Success message
    } else {
      Alert.alert("Invalid Input", "Please select a category and enter a valid amount."); // Error message for invalid input
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add a New Budget</Text>
      <View style={styles.pillsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.pill, selectedCategory === category.name && styles.selectedPill]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text style={styles.pillText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedCategory && (
        <>
          <Text style={styles.text}>Select Budget Type</Text>
          <View style={styles.pillsContainer}>
            <TouchableOpacity
              style={[styles.pill, budgetType === 'monthly' && styles.selectedPill]}
              onPress={() => setBudgetType('monthly')}
            >
              <Text style={styles.pillText}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, budgetType === 'weekly' && styles.selectedPill]}
              onPress={() => setBudgetType('weekly')}
            >
              <Text style={styles.pillText}>Weekly</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount.toString()}
            onChangeText={(text) => setAmount(parseFloat(text) || 0)}
          />
          <Button title="Add" onPress={handleAddBudget} />
        </>
      )}
    </View>
  );
};

export default AddBudget;
