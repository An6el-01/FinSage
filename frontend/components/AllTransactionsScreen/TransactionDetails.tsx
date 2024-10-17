import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigationTypes';
import { categoryColors, categoryEmojies } from '../../types/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite/next';
import { useGoalDataAccess } from '../../database/BudgetDataAccess';
import { categoryMapping } from '../../types/categoryMapping';

interface TransactionDetailsProps {
  navigation: NavigationProp<RootStackParamList, 'TransactionDetails'>;
  route: RouteProp<RootStackParamList, 'TransactionDetails'>;
}

export default function TransactionDetails({ navigation, route }: TransactionDetailsProps) {
  const { refreshBudget } = useGoalDataAccess();  
  const [amount, setAmount] = useState(route.params.amount);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense');
  const [filterType, setFilterType] = useState<'Needs' | 'Wants' | 'Income'>('Needs');
  const [description, setDescription] = useState<string>(''); 
  const [searchQuery, setSearchQuery] = useState<string>('');

  const db = useSQLiteContext(); 
  const [emojiScale] = useState(new Animated.Value(1)); // Scale animation value for the "jump" effect
  const [emojiAnimation, setEmojiAnimation] = useState<Animated.CompositeAnimation | null>(null); // Store reference to animation

  useEffect(() => {
    // Start or stop the continuous animation when the selected category changes
    if (selectedCategory && !emojiAnimation) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(emojiScale, {
            toValue: 1.4, // Scale up (jump effect)
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(emojiScale, {
            toValue: 1, // Scale back to original size
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      setEmojiAnimation(animation);
      animation.start();
    } else if (!selectedCategory && emojiAnimation) {
      emojiAnimation.stop(); // Stop animation when no category is selected
      setEmojiAnimation(null); // Reset animation reference
    }
  }, [selectedCategory]);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSpendPress = async () => {
    const storedUserId = await AsyncStorage.getItem('user_id');
    if (!storedUserId) {
      Alert.alert('Error', 'User not logged in. Please log in first.');
      return;
    }
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please enter a valid amount and select a category.');
      return;
    }

    const selectedCategoryId = categoryMapping[selectedCategory]?.id;
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Invalid category selected.');
      return;
    }

    // Adjust the type based on category type
    let transactionTypeToInsert = categoryMapping[selectedCategory].category === 'Income'
      ? 'Income'
      : 'Expense'; // Defaults to 'Expense' for Needs and Wants

    const transaction = {
      id: 0,
      user_id: Number(storedUserId),
      amount: Number(amount),
      description: description || 'No description',
      category_id: selectedCategoryId,
      date: date.getTime(),
      type: transactionTypeToInsert,
    };

    try {
      await db.runAsync(
        `INSERT INTO Transactions (user_id, category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?, ?);`,
        [
          transaction.user_id,
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      setAmount('');
      setDescription('');
      setSelectedCategory(null); // Unselect category after submission
      setTransactionType('Expense');
      setDate(new Date());

      Alert.alert('Success', 'Transaction added successfully');
      navigation.navigate("AllTransactions");
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
      console.error(error);
    }
  };

  const filterCategories = () => {
    return Object.keys(categoryMapping).filter(category => {
      const matchesType = categoryMapping[category].category === filterType;
      const matchesQuery = category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category); // Toggle selection
  };

  const animatedCategoryStyle = (category: string) => {
    if (category === selectedCategory) {
      return {
        transform: [{ scale: emojiScale }], // Apply the scale animation only to the selected category
      };
    }
    return {};
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.amountText}>£{amount}</Text>
        <TextInput
          placeholder="Transaction Description"
          value={description}
          onChangeText={setDescription}
          style={styles.descriptionInput}
        />
        <TouchableOpacity style={styles.actionButton} onPress={handleSpendPress}>
          <Text style={styles.actionText}>Spend</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <TouchableOpacity style={styles.detailRow} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.rowContent}>
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.rowText}>{date.toDateString()}</Text>
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        )}

        <Text style={styles.subHeader}>Categories</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {['Needs', 'Wants', 'Income'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, filterType === type && styles.activeFilter]}
              onPress={() => setFilterType(type as 'Needs' | 'Wants' | 'Income')}
            >
              <Text style={[styles.filterText, filterType === type && styles.activeFilterText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          {filterCategories().map(category => (
            <TouchableOpacity
              key={category}
              style={styles.categoryRow}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={[styles.categoryIconWrapper, { backgroundColor: categoryColors[category] }]}>
                <Animated.View style={animatedCategoryStyle(category)}>
                  <Text style={styles.categoryEmoji}>{categoryEmojies[category]}</Text>
                </Animated.View>
              </View>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionInput: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  subHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#2C2C2C',
  },
  activeFilter: {
    backgroundColor: '#28a745',
  },
  filterText: {
    color: '#888888',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
});
