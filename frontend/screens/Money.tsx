import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Goal, Category } from '../types/types';
import { useGoalDataAccess } from "../database/useGoalDataAccess";
import Card from '../components/ui/Card';
import AddGoal from '../components/AddGoal';
import UpdateGoal from '../components/UpdateGoal';
import DepositGoal from '../components/DepositGoal';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
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
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  goalItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  goalAmount: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  goalProgress: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  progress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  checkpoint: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 20,
    backgroundColor: colors.secondary,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    marginVertical: 5,
  },
  iconText: {
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  budgetInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  budgetCategoryContainer: {
    marginBottom: 20,
  },
  budgetCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
});

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

export default function Money() {
  const { getGoals, insertGoal, updateGoal, deleteGoal, depositGoal, getCategories } = useGoalDataAccess();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddGoal, setShowAddGoal] = React.useState<boolean>(false);
  const [showUpdateGoal, setShowUpdateGoal] = React.useState<Goal | null>(null);
  const [showDepositGoal, setShowDepositGoal] = React.useState<Goal | null>(null);
  const [budgets, setBudgets] = React.useState<{ [key: string]: { monthly: number | null, weekly: number | null } }>({});
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  React.useEffect(() => {
    loadGoalsAndCategories();
  }, []);

  const loadGoalsAndCategories = async () => {
    setLoading(true);
    const fetchedGoals = await getGoals();
    const fetchedCategories = await getCategories();
    setGoals(fetchedGoals);
    setCategories(fetchedCategories.filter((category: Category) => category.type === 'Expense'));
    setLoading(false);
  };

  const handleDeleteGoal = async (id: number) => {
    await deleteGoal(id);
    loadGoalsAndCategories();
  };

  const handleBudgetChange = (category: string, type: 'monthly' | 'weekly', value: string) => {
    setBudgets({
      ...budgets,
      [category]: {
        ...budgets[category],
        [type]: parseFloat(value) || null,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading Goals and Categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.text}>Financial Goals</Text>
        <Button title={showAddGoal ? "Exit" : "Add New Goal"} onPress={() => setShowAddGoal(!showAddGoal)} />
        {showAddGoal && <AddGoal insertGoal={insertGoal} loadGoals={loadGoalsAndCategories} setShowAddGoal={setShowAddGoal} />}
      </Card>

      {categories.map((category) => (
        <Card key={category.id} style={styles.budgetCategoryContainer}>
          <Text style={styles.budgetCategoryTitle}>{category.name} Budget</Text>
          <Text style={styles.text}>Set Monthly Budget</Text>
          <View style={styles.budgetInputContainer}>
            <TextInput
              style={styles.budgetInput}
              placeholder="Enter monthly budget"
              keyboardType="numeric"
              value={budgets[category.name]?.monthly?.toString() || ''}
              onChangeText={(text) => handleBudgetChange(category.name, 'monthly', text)}
            />
          </View>
          <Text style={styles.text}>Set Weekly Budget</Text>
          <View style={styles.budgetInputContainer}>
            <TextInput
              style={styles.budgetInput}
              placeholder="Enter weekly budget"
              keyboardType="numeric"
              value={budgets[category.name]?.weekly?.toString() || ''}
              onChangeText={(text) => handleBudgetChange(category.name, 'weekly', text)}
            />
          </View>
        </Card>
      ))}

      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalItem}>
          {showUpdateGoal?.id === goal.id ? (
            <UpdateGoal
              goal={showUpdateGoal}
              updateGoal={updateGoal}
              loadGoals={loadGoalsAndCategories}
              setShowUpdateGoal={setShowUpdateGoal}
            />
          ) : showDepositGoal?.id === goal.id ? (
            <DepositGoal
              goal={showDepositGoal}
              depositGoal={depositGoal}
              loadGoals={loadGoalsAndCategories}
              setShowDepositGoal={setShowDepositGoal}
            />
          ) : (
            <>
              <View style={styles.goalNameContainer}>
                <Text style={styles.goalName}>{goal.name}</Text>
              </View>
              <Text style={styles.goalAmount}>Goal: {formatCurrency(goal.amount)}</Text>
              <Text style={styles.goalProgress}>Progress: {formatCurrency(goal.progress)}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progress,
                    { width: `${(goal.progress / goal.amount) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowUpdateGoal(goal)}>
                  <Ionicons name="pencil" size={24} color={colors.primary} />
                  <Text style={styles.iconText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowDepositGoal(goal)}>
                  <Ionicons name="cash" size={24} color={colors.primary} />
                  <Text style={styles.iconText}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteGoal(goal.id)}>
                  <Ionicons name="trash" size={24} color={colors.primary} />
                  <Text style={styles.iconText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
