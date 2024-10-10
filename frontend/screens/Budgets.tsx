import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { TransactionsCategories, Budgets } from '../types/types';
import { useGoalDataAccess } from '../components/BudgetsScreen/BudgetDataAccess';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import AddBudget from '../components/BudgetsScreen/AddBudget';
import EditBudgetModal from '../components/BudgetsScreen/EditBudgetModal';
import { Ionicons } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import SavingsRecommendations from '../components/SavingsGoalsScreen/AISavingsRecommendations';  // Import the new component
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginHorizontal: 5, 
  },
  iconText: {
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
  },
  wizardButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

const Budgeting = () => {
  const { getCategories, insertBudget, getBudgets, deleteBudget, updateBudget, getTransactionsForCategory } = useGoalDataAccess();
  const [categories, setCategories] = React.useState<TransactionsCategories[]>([]);
  const [budgets, setBudgets] = React.useState<Budgets[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddBudget, setShowAddBudget] = React.useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = React.useState<boolean>(false);
  const [editCategory, setEditCategory] = React.useState<string>('');
  const [initialAmount, setInitialAmount] = React.useState<string>('');
  const [showRecommendations, setShowRecommendations] = React.useState<boolean>(false);  // State for showing recommendations

  React.useEffect(() => {
    const loadInitialData = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);

      const fetchedBudgets = await getBudgets();
      const budgetMap = await Promise.all(
        fetchedBudgets.map(async (budget) => {
          const category = fetchedCategories.find(cat => cat.id === budget.category_id);
          if (category) {
            let startDate, endDate;
            if (budget.type === 'weekly') {
              startDate = startOfWeek(new Date());
              endDate = endOfWeek(new Date());
            } else {
              startDate = startOfMonth(new Date());
              endDate = endOfMonth(new Date());
            }

            const transactions = await getTransactionsForCategory(budget.category_id, startDate, endDate);
            const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

            return {
              ...budget,
              spent,
            };
          }
        })
      );

      setBudgets(budgetMap.filter(Boolean) as Budgets[]);  // Filter out undefined values
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const handleAddBudget = async (categoryName: string, type: 'monthly' | 'weekly', amount: number) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      try {
        const userId = await AsyncStorage.getItem('user_id'); // Retrieve the user_id
        if (!userId) {
          Alert.alert("Error", "User not logged in. Please log in to add a budget.");
          return;
        }
        await insertBudget(parseInt(userId), category.id, amount, type); // Pass user_id when inserting
        await loadBudgets(); // Reload budgets from the database
        setShowAddBudget(false);
        Alert.alert("Success", "Budget added successfully!"); // Success message
      } catch (error) {
        console.error('Error adding budget:', error);
        Alert.alert("Error", "There was an issue adding the budget. Please try again."); // Error message
      }
    } else {
      Alert.alert("Error", "Category not found. Please select a valid category."); // Error message
    }
  };


  const loadBudgets = async () => {
    const fetchedBudgets = await getBudgets();
    const budgetMap = await Promise.all(
      fetchedBudgets.map(async (budget) => {
        const category = categories.find(cat => cat.id === budget.category_id);
        if (category) {
          let startDate, endDate;
          if (budget.type === 'weekly') {
            startDate = startOfWeek(new Date());
            endDate = endOfWeek(new Date());
          } else {
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
          }

          const transactions = await getTransactionsForCategory(budget.category_id, startDate, endDate);
          const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

          return {
            ...budget,
            spent,
          };
        }
      })
    );

    setBudgets(budgetMap.filter(Boolean) as Budgets[]);  // Filter out undefined values
  };

  const handleDeleteBudget = (category: string) => {
    const budget = budgets.find(budget => categories.find(cat => cat.id === budget.category_id)?.name === category);
    if (!budget) return;

    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete the ${category} budget?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            await deleteBudget(budget.category_id, budget.type);
            await loadBudgets(); // Reload budgets after deletion
          },
          style: "destructive"
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading Budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.wizardButton}
          onPress={() => {
            console.log('Magic wand icon pressed');
            setShowRecommendations(true);
          }}
          >
          <SimpleLineIcons name="magic-wand" size={32} color={colors.primary}/> 
          <Text style={styles.iconText}>Ask Ai</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Budgeting</Text>
        {showAddBudget ? (
          <>
            <Button title="Back" onPress={() => setShowAddBudget(false)} />
            <AddBudget categories={categories} onAddBudget={handleAddBudget} />
          </>
        ) : (
          <Button title="Add a Budget" onPress={() => setShowAddBudget(true)} />
        )}
        {budgets.map((budget) => {
          const category = categories.find(cat => cat.id === budget.category_id);
          if (!category) return null;

          return (
            <Card key={category.name} style={styles.budgetCategoryContainer}>
              <View style={styles.budgetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.budgetTitle}>{category.name} Budget:</Text>
                  <Text style={styles.budgetAmount}>${budget.amount}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    style={styles.iconWrapper}
                    onPress={() => {
                      setEditCategory(category.name);
                      setInitialAmount(String(budget.amount));
                      setEditModalVisible(true);
                    }}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                    <Text style={styles.iconText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconWrapper} onPress={() => handleDeleteBudget(category.name)}>
                    <Ionicons name="trash" size={20} color={colors.primary} />
                    <Text style={styles.iconText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ProgressBar progress={budget.amount ? budget.spent / budget.amount : 0} />
              <View style={styles.budgetFooter}>
                <Text style={styles.budgetLeftText}>
                  Left to spend: ${budget.amount - budget.spent}
                </Text>
                <View style={styles.budgetTypePill}>
                  <Text style={styles.budgetTypeText}>{budget.type === 'monthly' ? 'Monthly' : 'Weekly'}</Text>
                </View>
              </View>
            </Card>
          );
        })}
        <EditBudgetModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          updateBudget={updateBudget}
          loadBudgets={loadBudgets}
          budgets={budgets.reduce((acc, budget) => {
            const category = categories.find(cat => cat.id === budget.category_id);
            if (category) {
              acc[category.name] = budget;
            }
            return acc;
          }, {} as { [key: string]: Budgets })}
          categories={categories}
          category={editCategory}
          initialAmount={initialAmount}
        />
      </ScrollView>

      <Modal
        visible={showRecommendations}
        animationType="slide"
        onRequestClose={() => setShowRecommendations(false)}
      >
        <SavingsRecommendations
          onClose={() => setShowRecommendations(false)}
        />
      </Modal>
    </View>
  );
};

export default Budgeting;
