import * as React from 'react';
import { ScrollView, Text, View, StyleSheet, Button, TextInput, ActivityIndicator } from 'react-native';
import { Goal } from '../types';
import { useGoalDataAccess } from "../components/GoalDataAccess";
import  Card  from '../components/ui/Card'

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

export default function Goals() {
    const { getGoals, insertGoal, updateGoal, deleteGoal } = useGoalDataAccess();
    const [goals, setGoals] = React.useState<Goal[]>([]);
    const [newGoal, setNewGoal] = React.useState<Goal>({ id: 0, name: '', amount: 0, progress: 0 });
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        setLoading(true);
        const fetchedGoals = await getGoals();
        setGoals(fetchedGoals);
        setLoading(false);
    };

    const handleAddGoal = async () => {
        await insertGoal(newGoal);
        setNewGoal({ id: 0, name: '', amount: 0, progress: 0 });
        loadGoals();
    };

    const handleUpdateGoal = async (goal: Goal) => {
        await updateGoal(goal);
        loadGoals();
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
            {goals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                    <Text>{goal.name}</Text>
                    <Text>{goal.amount}</Text>
                    <Text>{goal.progress}</Text>
                    <Button title="Update" onPress={() => handleUpdateGoal(goal)} />
                    <Button title="Delete" onPress={() => handleDeleteGoal(goal.id)} />
                </View>
            ))}
            <TextInput
                style={styles.input}
                placeholder="Goal Name"
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({ ...newGoal, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Goal Amount"
                value={newGoal.amount.toString()}
                onChangeText={(text) => setNewGoal({ ...newGoal, amount: parseFloat(text) })}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Goal Progress"
                value={newGoal.progress.toString()}
                onChangeText={(text) => setNewGoal({ ...newGoal, progress: parseFloat(text) })}
                keyboardType="numeric"
            />
            <Button title="Add Goal" onPress={handleAddGoal} />
            </Card>
        </ScrollView>
    );
}
