import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Goal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import Card from '../components/ui/Card';
import AddGoal from '../components/AddGoal';
import UpdateGoal from '../components/UpdateGoal';
import DepositGoal from '../components/DepositGoal';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ui/ProgressBar'; 

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
});

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

export default function FinancialGoals() {
  const { getGoals, insertGoal, updateGoal, deleteGoal, depositGoal } = useGoalDataAccess();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddGoal, setShowAddGoal] = React.useState<boolean>(false);
  const [showUpdateGoal, setShowUpdateGoal] = React.useState<Goal | null>(null);
  const [showDepositGoal, setShowDepositGoal] = React.useState<Goal | null>(null);

  React.useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    const fetchedGoals = await getGoals();
    setGoals(fetchedGoals);
    setLoading(false);
  };

  const handleDeleteGoal = async (id: number) => {
    await deleteGoal(id);
    loadGoals();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading Goals...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.text}>Financial Goals</Text>
        <Button title={showAddGoal ? "Exit" : "Add New Goal"} onPress={() => setShowAddGoal(!showAddGoal)} />
        {showAddGoal && <AddGoal insertGoal={insertGoal} loadGoals={loadGoals} setShowAddGoal={setShowAddGoal} />}
      </Card>

      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalItem}>
          {showUpdateGoal?.id === goal.id ? (
            <UpdateGoal
              goal={showUpdateGoal}
              updateGoal={updateGoal}
              loadGoals={loadGoals}
              setShowUpdateGoal={setShowUpdateGoal}
            />
          ) : showDepositGoal?.id === goal.id ? (
            <DepositGoal
              goal={showDepositGoal}
              depositGoal={depositGoal}
              loadGoals={loadGoals}
              setShowDepositGoal={setShowDepositGoal}
            />
          ) : (
            <>
              <View style={styles.goalNameContainer}>
                <Text style={styles.goalName}>{goal.name}</Text>
              </View>
              <Text style={styles.goalAmount}>Goal: {formatCurrency(goal.amount)}</Text>
              <Text style={styles.goalProgress}>Progress: {formatCurrency(goal.progress)}</Text>
              <ProgressBar progress={goal.progress / goal.amount} />
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
