import * as React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { SavingsGoals } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

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

export default function AddGoal({ insertGoal, loadGoals, setShowAddGoal }: { insertGoal: (goal: SavingsGoals) => Promise<void>, loadGoals: () => Promise<void>, setShowAddGoal: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [newGoal, setNewGoal] = React.useState<SavingsGoals>({ id: 0, user_id: 0, name: '', amount: 0, progress: 0, target_date: Date.now() });
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const handleAddGoal = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');

            if (!userId) {
                throw new Error("User ID not found");
            }
            const goalToInsert = { ...newGoal, user_id: parseInt(userId), target_date: newGoal.target_date || Date.now() };
            await insertGoal(goalToInsert);
            setNewGoal({ id: 0, user_id: 0, name: '', amount: 0, progress: 0, target_date: Date.now() });
            loadGoals();
            setShowAddGoal(false);
        } catch (error) {
            console.error("Error adding goal: ", error);
        }
    };

    const handleAmountChange = (text: string) => {
        const amount = parseFloat(text);
        setNewGoal((prevGoal) => ({ ...prevGoal, amount: isNaN(amount) ? 0 : amount }));
    };

    const handleProgressChange = (text: string) => {
        const progress = parseFloat(text);
        setNewGoal((prevGoal) => ({ ...prevGoal, progress: isNaN(progress) ? 0 : progress }));
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setNewGoal((prevGoal) => ({ ...prevGoal, target_date: selectedDate.getTime() }));
        }
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                    Select Target Date: {new Date(newGoal.target_date || Date.now()).toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={new Date(newGoal.target_date || Date.now())}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            <Button title="Add Goal" onPress={handleAddGoal} />
        </View>
    );
}
