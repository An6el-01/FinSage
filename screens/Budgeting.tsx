import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Category } from '../types';
import { useGoalDataAccess } from '../dataHandling/useGoalDataAccess';
import Card from '../components/ui/Card';
import CustomSlider from '../components/ui/CustomSlider';
import ProgressBar from '../components/ui/ProgressBar';
import AddBudget from '../components/ui/AddBudget';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primary: "#FCB900",
  secondary: "#F9A800",
  text: "#212121",
  background: "#F5F5F5",
  cardBackground: "#FFFFFF",
  buttonText: "#FFFFFF",
  progressBackground: "#E0E0E0",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 15,
  },
  text: {
    fontSize: 18,
    color: colors.text,
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
    textAlign: 'center',
  },
  budgetCategoryContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  budgetAmount: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 5,
  },
  budgetTypePill: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetTypeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  selectedPill: {
    backgroundColor: colors.secondary,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  budgetLeftText: {
    fontSize: 14,
    color: colors.text,
  },
  editIcon: {
    position: 'absolute',
    right: 10,
  },
});

const Budgeting = () => {
  const { getCategories } = useGoalDataAccess();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [budgets, setBudgets] = React.useState<{ [key: string]: { monthly: number | null, weekly: number | null, spent: number, type: 'monthly' | 'weekly' } }>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddBudget, setShowAddBudget] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories.filter((category: Category) => category.type === 'Expense'));
    setLoading(false);
  };

  const handleAddBudget = (category: string, type: 'monthly' | 'weekly', amount: number) => {
    setBudgets({
      ...budgets,
      [category]: {
        ...budgets[category],
        [type]: amount,
        spent: 0,
        type: type,
      },
    });
    setShowAddBudget(false);
  };

  const handleEditBudget = (category: string) => {
    // Implement edit functionality here
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading Categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.text}>Budgeting</Text>
      {showAddBudget ? (
        <>
          <Button title="Back" onPress={() => setShowAddBudget(false)} />
          <AddBudget categories={categories} onAddBudget={handleAddBudget} />
        </>
      ) : (
        <Button title="Add a Budget" onPress={() => setShowAddBudget(true)} />
      )}
      {Object.keys(budgets).map((category) => (
        <Card key={category} style={styles.budgetCategoryContainer}>
          <View style={styles.budgetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.budgetTitle}>{category} Budget:</Text>
              <Text style={styles.budgetAmount}>${budgets[category][budgets[category].type]}</Text>
            </View>
            <TouchableOpacity style={styles.editIcon} onPress={() => handleEditBudget(category)}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ProgressBar progress={budgets[category][budgets[category].type] ? budgets[category].spent / budgets[category][budgets[category].type]! : 0} />
          <View style={styles.budgetFooter}>
            <Text style={styles.budgetLeftText}>
              Left to spend: ${budgets[category][budgets[category].type]! - budgets[category].spent}
            </Text>
            <View style={styles.budgetTypePill}>
              <Text style={styles.budgetTypeText}>{budgets[category].type === 'monthly' ? 'Monthly' : 'Weekly'}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

export default Budgeting;
