import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { Goal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import Card from '../components/ui/Card';
import AddGoal from '../components/AddGoal';
import UpdateGoal from '../components/UpdateGoal'; // Import the UpdateGoal component
import DepositGoal from '../components/DepositGoal'; // Import the DepositGoal component

const colors = {
  primary: "#FCB900",
  secondary: "#F9A800",
  text: "#212121",
  background: "#F5F5F5",
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
    backgroundColor: '#fff',
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
});

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

export default function Goals() {
  const { getGoals, insertGoal, updateGoal, deleteGoal, depositGoal } = useGoalDataAccess();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showAddGoal, setShowAddGoal] = React.useState<boolean>(false);
  const [showUpdateGoal, setShowUpdateGoal] = React.useState<Goal | null>(null); // Track the goal to update
  const [showDepositGoal, setShowDepositGoal] = React.useState<Goal | null>(null); // Track the goal to deposit

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
      <View style={styles.container}>
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
              <Text>{goal.name}</Text>
              <Text>{formatCurrency(goal.amount)}</Text>
              <Text>{formatCurrency(goal.progress)}</Text>
              <Button title="Update" onPress={() => setShowUpdateGoal(goal)} />
              <Button title="Deposit" onPress={() => setShowDepositGoal(goal)} />
              <Button title="Delete" onPress={() => handleDeleteGoal(goal.id)} />
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
