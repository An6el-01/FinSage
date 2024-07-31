import * as React from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { SubGoal } from '../types';

const styles = StyleSheet.create({
    container: {
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
    text: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

type AddSubGoalProps = {
    addSubGoal: (subGoal: SubGoal) => void;
    goalId: number;
};

const AddSubGoal: React.FC<AddSubGoalProps> = ({ addSubGoal, goalId }) => {
    const [name, setName] = React.useState<string>('');
    const [amount, setAmount] = React.useState<string>('');

    const handleAddSubGoal = () => {
        if (name && amount) {
            const newSubGoal: SubGoal = {
                id: Date.now(),
                name,
                amount: parseFloat(amount),
                progress: 0,
            };
            addSubGoal(newSubGoal);
            setName('');
            setAmount('');
    }
};

return(
    <View style={styles.container}>
        <Text style={styles.text}>Add New Sub-Goal</Text>
        <TextInput
            style={styles.input}
            placeholder='Sub-Goal Name'
            value={name}
            onChangeText={setName}
        />
        <TextInput
            style={styles.input}
            placeholder='Amount'
            keyboardType='numeric'
            value={amount}
            onChangeText={setAmount}
        />

        <Button title="Add Sub-Goal" onPress={handleAddSubGoal}/>
    </View>
);
};

export default AddSubGoal;