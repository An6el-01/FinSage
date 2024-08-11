import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

interface EditBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newAmount: number, newType: 'monthly' | 'weekly') => void;
  category: string;
  initialAmount: string;
  initialType: 'monthly' | 'weekly';
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  category,
  initialAmount,
  initialType,
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [type, setType] = useState<'monthly' | 'weekly'>(initialType);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      onSave(parsedAmount, type);
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
          <View style={styles.pillsContainer}>
            <TouchableOpacity
              style={[styles.pill, type === 'monthly' && styles.selectedPill]}
              onPress={() => setType('monthly')}
            >
              <Text style={styles.pillText}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, type === 'weekly' && styles.selectedPill]}
              onPress={() => setType('weekly')}
            >
              <Text style={styles.pillText}>Weekly</Text>
            </TouchableOpacity>
          </View>
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
  selectedBackground: "#FFD700", // Highlight color for selected pill
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
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPill: {
    backgroundColor: colors.selectedBackground,
  },
  pillText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EditBudgetModal;
