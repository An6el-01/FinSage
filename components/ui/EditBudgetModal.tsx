import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Category, Budget } from '../../Misc/types'; // Import the Category and Budget types

interface EditBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  updateBudget: (categoryId: number, amount: number, type: 'monthly' | 'weekly') => Promise<void>; // Expect 3 arguments
  loadBudgets: () => Promise<void>;
  budgets: { [key: string]: Budget };  // Add budgets here
  categories: Category[];  // Use the imported Category type here
  category: string;
  initialAmount: string;
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  visible,
  onClose,
  updateBudget,
  loadBudgets,
  budgets,  // Receive budgets as a prop
  categories,  // Receive categories as a prop
  category,
  initialAmount,
}) => {
  const [amount, setAmount] = useState(initialAmount);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      const categoryData = categories.find(cat => cat.name === category);
      if (categoryData) {
        const budgetData = budgets[category];  // Get the current budget for this category
        const currentAmount = budgetData ? budgetData.amount : 0;
        const amountChanged = parsedAmount !== currentAmount;

        if (amountChanged && budgetData) {
          await updateBudget(categoryData.id, parsedAmount, budgetData.type); // Pass the type as well
          await loadBudgets(); // Reload budgets after editing
        }

        onClose(); // Close the modal after saving
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit {category} Budget</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <View style={styles.buttonsContainer}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const colors = {
  primary: "#FCB900",
  secondary: "#F9A800",
  text: "#212121",
  background: "#F5F5F5",
  selectedBackground: "#FFD700",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EditBudgetModal;
