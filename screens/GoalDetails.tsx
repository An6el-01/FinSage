import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Goal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import SubGoalComponent from '../components/SubGoalComponent';

const colors = {
  primary: "#FCB900",
  text: "#212121",
  background: "#F5F5F5",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  goalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  goalAmount: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 5,
  },
  subGoalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: colors.text,
  },
});

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

type GoalDetailsRouteProp = RouteProp<{ GoalDetails: { goalId: number } }, 'GoalDetails'>;

const GoalDetails: React.FC = () => {
  const route = useRoute<GoalDetailsRouteProp>();
  const { goalId } = route.params;
  const { getGoals } = useGoalDataAccess();
  const [goal, setGoal] = React.useState<Goal | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    setLoading(true);
    const fetchedGoals = await getGoals();
    const selectedGoal = fetchedGoals.find((g) => g.id === goalId) || null;
    setGoal(selectedGoal);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text>Goal not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.goalName}>{goal.name}</Text>
      <Text style={styles.goalAmount}>Goal: {formatCurrency(goal.amount)}</Text>
      <Text style={styles.goalAmount}>Progress: {formatCurrency(goal.progress)}</Text>
      <Text style={styles.subGoalTitle}>Sub-Goals</Text>
      {goal.subGoals && goal.subGoals.length > 0 ? (
        goal.subGoals.map((subGoal) => (
          <SubGoalComponent
            key={subGoal.id}
            subGoal={subGoal}
            updateSubGoal={() => {}}
            deleteSubGoal={() => {}}
          />
        ))
      ) : (
        <Text>No sub-goals available</Text>
      )}
    </ScrollView>
  );
};

export default GoalDetails;
