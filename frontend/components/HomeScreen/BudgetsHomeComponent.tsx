// frontend/components/HomeScreen/SavingsGoalsProgress.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';

const BudgetsHomeComponents = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  // Placeholder data for savings goals. Replace with real data.
  const Budgets = [
    { name: 'Budget 1', progress: 60 },
    { name: 'Budget 2', progress: 80 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>
      {Budgets.map((budget, index) => (
        <View key={index} style={styles.goalRow}>
          <Text style={styles.goalText}>{budget.name}</Text>
          <Text style={styles.goalProgress}>{budget.progress}% complete</Text>
        </View>
      ))}
      <Button title="View All Budgets" onPress={() => navigation.navigate('Budgets')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalRow: {
    marginBottom: 5,
  },
  goalText: {
    fontSize: 16,
  },
  goalProgress: {
    fontSize: 14,
    color: '#888',
  },
});

export default BudgetsHomeComponents;
