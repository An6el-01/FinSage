import * as React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Goal } from '../types/types';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

const styles = StyleSheet.create({
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default function UpdateGoal({ goal, updateGoal, loadGoals, setShowUpdateGoal }: { goal: Goal, updateGoal: (goal: Goal) => Promise<void>, loadGoals: () => Promise<void>, setShowUpdateGoal: React.Dispatch<React.SetStateAction<Goal | null>> }) {
  const [updatedGoal, setUpdatedGoal] = React.useState<Goal>({ ...goal });

  const handleUpdateGoal = async () => {
    await updateGoal(updatedGoal);
    loadGoals();
    setShowUpdateGoal(null); // Close the UpdateGoal component
  };

  const handleAmountChange = (text: string) => {
    const amount = parseFloat(text);
    setUpdatedGoal((prevGoal) => ({ ...prevGoal, amount: isNaN(amount) ? 0 : amount }));
  };

  const handleProgressChange = (text: string) => {
    const progress = parseFloat(text);
    setUpdatedGoal((prevGoal) => ({ ...prevGoal, progress: isNaN(progress) ? 0 : progress }));
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Goal Name"
        value={updatedGoal.name}
        onChangeText={(text) => setUpdatedGoal({ ...updatedGoal, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Goal Amount"
        value={updatedGoal.amount === 0 ? '' : updatedGoal.amount.toString()}
        onChangeText={handleAmountChange}
        keyboardType='numeric'
      />
      <TextInput
        style={styles.input}
        placeholder='Progress So Far'
        value={updatedGoal.progress === 0 ? '' : updatedGoal.progress.toString()}
        onChangeText={handleProgressChange}
        keyboardType='numeric'
      />
      <Button title="Update Goal" onPress={handleUpdateGoal} />
      <Button title="Cancel" onPress={() => setShowUpdateGoal(null)} color="red" />
    </View>
  );
}
