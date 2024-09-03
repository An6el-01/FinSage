import * as React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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

export default function AddGoal({ insertGoal, loadGoals, setShowAddGoal }: { insertGoal: (goal: Goal) => Promise<void>, loadGoals: () => Promise<void>, setShowAddGoal: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [newGoal, setNewGoal] = React.useState<Goal>({ id: 0, name: '', amount: 0, progress: 0 });

    const handleAddGoal = async () => {
        await insertGoal(newGoal);
        setNewGoal({ id: 0, name: '', amount: 0, progress: 0 });
        loadGoals();
        setShowAddGoal(false); // Close the AddGoal component
    };

    const handleAmountChange = (text: string) => {
        const amount = parseFloat(text);
        setNewGoal((prevGoal) => ({ ...prevGoal, amount: isNaN(amount) ? 0 : amount }));
    };

    const handleProgressChange = (text: string) => {
        const progress = parseFloat(text);
        setNewGoal((prevGoal) => ({ ...prevGoal, progress: isNaN(progress) ? 0 : progress }));
    };

    return (
        <View>
            <TextInput
                style={styles.input}
                placeholder="Goal Name"
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({ ...newGoal, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Goal Amount"
                value={newGoal.amount === 0 ? '' : newGoal.amount.toString()}
                onChangeText={handleAmountChange}
                keyboardType='numeric'
            />
            <TextInput
                style={styles.input}
                placeholder='Progress So Far'
                value={newGoal.progress === 0 ? '' : newGoal.progress.toString()}
                onChangeText={handleProgressChange}
                keyboardType='numeric'
            />
            <Button title="Add Goal" onPress={handleAddGoal} />
        </View>
    );
}
