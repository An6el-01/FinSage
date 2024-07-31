import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubGoal } from '../types';
import { categoryColors } from '../constants';

const styles = StyleSheet.create({
    subGoalContainer: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    subGoalText: {
        fontSize: 16,
        color: '#333',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        marginBottom: 10,
        marginTop: 5,
    },
    progress: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: categoryColors['18'],
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    button: {
        backgroundColor: categoryColors['18'],
        padding: 5,
        borderRadius: 5,
        marginVertical: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
}

type SubGoalComponentProps = {
    subGoal: SubGoal;
    updateSubGoal: (subGoal: SubGoal) => void;
    deleteSubGoal: (id: number) => void;
};

const SubGoalComponent: React.FC<SubGoalComponentProps> = ({ subGoal, updateSubGoal, deleteSubGoal }) => {
    return (
      <View style={styles.subGoalContainer}>
        <Text style={styles.subGoalText}>{subGoal.name}</Text>
        <Text style={styles.subGoalText}>Goal: {formatCurrency(subGoal.amount)}</Text>
        <Text style={styles.subGoalText}>Progress: {formatCurrency(subGoal.progress)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${(subGoal.progress / subGoal.amount) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => updateSubGoal(subGoal)}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => deleteSubGoal(subGoal.id)}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  export default SubGoalComponent;
