import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Goal, SubGoal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import Card from '../components/ui/Card';
import AddGoal from '../components/AddGoal';
import UpdateGoal from '../components/UpdateGoal';
import DepositGoal from '../components/DepositGoal';
import SubGoalComponent from '../components/SubGoalComponent';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigationTypes'; // Import the navigation types
import { Ionicons } from '@expo/vector-icons'; // Import icon library from Expo

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
  addSubGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
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
  const [newSubGoalName, setNewSubGoalName] = React.useState<string>('');
  const [newSubGoalAmount, setNewSubGoalAmount] = React.useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'GoalDetails'>>(); // Use the defined navigation type

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

  const addSubGoal = (goalId: number) => {
    const subGoal: SubGoal = {
      id: Date.now(),
      name: newSubGoalName,
      amount: parseFloat(newSubGoalAmount),
      progress: 0,
    };
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, subGoals: [...(goal.subGoals || []), subGoal] } : goal
    );
    setGoals(updatedGoals);
    setNewSubGoalName('');
    setNewSubGoalAmount('');
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

  const handleViewMore = (goalId: number) => {
    navigation.navigate('GoalDetails', { goalId });
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
                <TouchableOpacity onPress={() => handleViewMore(goal.id)}>
                  <Ionicons name="eye" size={24} color={colors.primary} />
                </TouchableOpacity>
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
                {goal.subGoals?.map((subGoal, index) => (
                  <View
                    key={index}
                    style={[
                      styles.checkpoint,
                      { left: `${(subGoal.amount / goal.amount) * 100}%` },
                    ]}
                  />
                ))}
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
                <TouchableOpacity style={styles.iconButton} onPress={() => toggleSubGoalsVisibility(goal.id)}>
                  <Ionicons name={visibleSubGoals[goal.id] ? "chevron-up" : "chevron-down"} size={24} color={colors.primary} />
                  <Text style={styles.iconText}>Sub-Goals</Text>
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
                  <View style={styles.addSubGoalContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Sub-Goal Name"
                      value={newSubGoalName}
                      onChangeText={setNewSubGoalName}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Amount"
                      keyboardType="numeric"
                      value={newSubGoalAmount}
                      onChangeText={setNewSubGoalAmount}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={() => addSubGoal(goal.id)}>
                      <Ionicons name="add-circle" size={24} color={colors.primary} />
                      <Text style={styles.iconText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
