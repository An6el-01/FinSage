import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes'; // Adjust the import path if necessary

// Explicitly type the props to include the correct type for navigation
interface NewTransactionInputProps {
  navigation: NavigationProp<RootStackParamList, 'NewTransactionInput'>;
}

export default function NewTransactionInput({ navigation }: NewTransactionInputProps) {
  const [amount, setAmount] = useState("0");

  const handlePress = (value: string) => {
    if (amount === "0") {
      setAmount(value);
    } else {
      setAmount(amount + value);
    }
  };

  const handleDelete = () => {
    setAmount(amount.length > 1 ? amount.slice(0, -1) : "0");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate("AllTransactions")}>
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>

      <Text style={styles.amountText}>£{amount}</Text>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((value) => (
          <TouchableOpacity
            key={value}
            style={styles.key}
            onPress={() => handlePress(value.toString())}
          >
            <Text style={styles.keyText}>{value}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={handleDelete}>
          <Ionicons name="backspace" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('TransactionDetails', { amount })} // Pass the amount as a parameter
            >
             <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  amountText: {
    fontSize: 48,
    color: 'white',
    marginBottom: 30,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '80%',
  },
  key: {
    width: '30%',
    padding: 20,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    color: 'white',
  },
  continueButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 30,
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
