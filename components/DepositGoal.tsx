import * as React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Goal } from '../types';

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
  });

export default function DepositGoal({ goal, depositGoal, loadGoals, setShowDepositGoal }: { goal: Goal, depositGoal: (goal: Goal, amount: number) => Promise<void>, loadGoals: () => Promise<void>, setShowDepositGoal: React.Dispatch<React.SetStateAction<Goal | null>> }) {
    const [depositAmount, setDepositAmount] = React.useState<string>('');

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if(!isNaN(amount) && amount > 0){
            await depositGoal(goal, amount);
            loadGoals();
            setShowDepositGoal(null); //Close the deposit component
        }
    };

    return(
        <View>
            <TextInput
                style={styles.input}
                placeholder="Deposit To Goal"
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType='numeric'
            />
            <Button title="Deposit" onPress={handleDeposit} />
            <Button title="Cancel" onPress={() => setShowDepositGoal(null)} color="red"/>
        </View>
    );
}