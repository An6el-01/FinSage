import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Category, Budget } from '../Misc/types';
import { useGoalDataAccess } from '../database/useGoalDataAccess';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import AddBudget from '../components/ui/AddBudget';
import EditBudgetModal from '../components/ui/EditBudgetModal';
import { Ionicons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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
});

const Budgeting = () => {
  const { getCategories, insertBudget, getBudgets, deleteBudget, updateBudget, getTransactionsForCategory } = useGoalDataAccess();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddBudget, setShowAddBudget] = React.useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = React.useState<boolean>(false);
  const [editCategory, setEditCategory] = React.useState<string>('');
  const [initialAmount, setInitialAmount] = React.useState<string>('');

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

      setBudgets(budgetMap.filter(Boolean) as Budget[]);  // Filter out undefined values
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const handleAddBudget = async (categoryName: string, type: 'monthly' | 'weekly', amount: number) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      await insertBudget(category.id, amount, type);
      await loadBudgets(); // Reload budgets from the database
      setShowAddBudget(false);
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

    setBudgets(budgetMap.filter(Boolean) as Budget[]);  // Filter out undefined values
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
        }, {} as { [key: string]: Budget })}
        categories={categories}
        category={editCategory}
        initialAmount={initialAmount}
      />
    </ScrollView>
  );
};

export default Budgeting;
