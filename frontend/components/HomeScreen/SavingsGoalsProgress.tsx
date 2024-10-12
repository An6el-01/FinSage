import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';
import ProgressBar from '../ui/ProgressBar';  // Assuming there's a ProgressBar component
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


// Define the interface for props
interface SavingsGoalsProgressProps {
  goals: { name: string; progress: number; target: number; targetDate: string }[];  // Adjust the type if needed
}

const SavingsGoalsProgress: React.FC<SavingsGoalsProgressProps> = ({ goals }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Savings Goals</Text>

      {goals.length === 0 ? (
        <Text style={styles.noGoalsText}>No favorited goals to display</Text>
      ) : (
        goals.map((goal, index) => {
          const progressPercentage = goal.progress / goal.target;
          const targetDate = new Date(goal.targetDate).toLocaleDateString();

          return (
            <View key={index} style={styles.goalCard}>
              <View style={styles.goalRow}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalProgress}>
                  {formatCurrency(goal.progress)} / {formatCurrency(goal.target)}
                </Text>
              </View>
              <ProgressBar progress={progressPercentage} />
              <Text style={styles.goalTargetDate}>Target Date: {targetDate}</Text>
            </View>
          );
        })
      )}

      {/* View All Goals Button - Displayed only once */}
      <TouchableOpacity onPress={() => navigation.navigate('SavingsGoals')}>
        <LinearGradient
          colors={['#007BFF', '#00BFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.viewAllButton}
        >
          <Ionicons name="arrow-forward-circle" size={20} color="white" />
          <Text style={styles.viewAllButtonText}>View All Savings Goals</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalProgress: {
    fontSize: 14,
    color: '#888',
  },
  goalTargetDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  noGoalsText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  viewAllButtonText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SavingsGoalsProgress;
