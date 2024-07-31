import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Goal, SubGoal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import Card from '../components/ui/Card';
import AddGoal from '../components/AddGoal';
import UpdateGoal from '../components/UpdateGoal';
import DepositGoal from '../components/DepositGoal';
import SubGoalComponent from '../components/SubGoalComponent';
import AddSubGoal from '../components/AddSubGoal';

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
  },
  progress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: colors.buttonText,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  subGoalList: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  subGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: colors.text,
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
  const [showUpdateGoal, setShowUpdateGoal] = React.useState<Goal | null>(null);
  const [showDepositGoal, setShowDepositGoal] = React.useState<Goal | null>(null);
  const [visibleSubGoals, setVisibleSubGoals] = React.useState<{ [key: number]: boolean }>({});

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

  const addSubGoal = (goalId: number, subGoal: SubGoal) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, subGoals: [...(goal.subGoals || []), subGoal] } : goal
    );
    setGoals(updatedGoals);
  };

  const updateSubGoal = (goalId: number, updatedSubGoal: SubGoal) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            subGoals: goal.subGoals?.map(subGoal =>
              subGoal.id === updatedSubGoal.id ? updatedSubGoal : subGoal
            ),
          }
        : goal
    );
    setGoals(updatedGoals);
  };

  const deleteSubGoal = (goalId: number, subGoalId: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId
        ? { ...goal, subGoals: goal.subGoals?.filter(subGoal => subGoal.id !== subGoalId) }
        : goal
    );
    setGoals(updatedGoals);
  };

  const toggleSubGoalsVisibility = (goalId: number) => {
    setVisibleSubGoals(prevState => ({
      ...prevState,
      [goalId]: !prevState[goalId],
    }));
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
              <Text style={styles.goalName}>{goal.name}</Text>
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
                <TouchableOpacity style={styles.button} onPress={() => setShowUpdateGoal(goal)}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setShowDepositGoal(goal)}>
                  <Text style={styles.buttonText}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleDeleteGoal(goal.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => toggleSubGoalsVisibility(goal.id)}>
                  <Text style={styles.buttonText}>
                    {visibleSubGoals[goal.id] ? "Sub Goal": "Sub Goal"}
                  </Text>
                </TouchableOpacity>
              </View>
              {visibleSubGoals[goal.id] && (
                <View style={styles.subGoalList}>
                  <Text style={styles.subGoalTitle}>Sub-Goals</Text>
                  {goal.subGoals?.map(subGoal => (
                    <SubGoalComponent
                      key={subGoal.id}
                      subGoal={subGoal}
                      updateSubGoal={(updatedSubGoal) => updateSubGoal(goal.id, updatedSubGoal)}
                      deleteSubGoal={(subGoalId) => deleteSubGoal(goal.id, subGoalId)}
                    />
                  ))}
                  <AddSubGoal addSubGoal={(subGoal) => addSubGoal(goal.id, subGoal)} goalId={goal.id} />
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
