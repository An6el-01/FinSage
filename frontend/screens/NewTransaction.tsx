import * as React from 'react';
import { ScrollView, View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Card from '../components/ui/Card';
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useSQLiteContext } from 'expo-sqlite/next';
import { Category, Transaction } from '../Misc/types';
import { useGoalDataAccess } from '../database/useGoalDataAccess';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import the date picker

export default function NewTransaction() {
  const db = useSQLiteContext();
  const { getBudgets, updateBudget, getTransactionsForCategory } = useGoalDataAccess();
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("Expense");
  const [categoryId, setCategoryId] = React.useState<number>(1);
  const [date, setDate] = React.useState<Date>(new Date()); // Add state for date
  const [showDatePicker, setShowDatePicker] = React.useState<boolean>(false); // Add state to control the date picker visibility

  React.useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  async function getExpenseType(currentTab: number) {
    setCategory(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
  }

  const insertTransaction = async (transaction: Transaction) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);`,
        [
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type
        ]
      );
    });
  };

  const refreshBudget = async (categoryId: number) => {
    const budgets = await getBudgets();
    const budget = budgets.find(b => b.category_id === categoryId);
    
    if (budget) {
        const startDate = budget.type === 'weekly' ? startOfWeek(new Date()) : startOfMonth(new Date());
        const endDate = budget.type === 'weekly' ? endOfWeek(new Date()) : endOfMonth(new Date());
        const transactions = await getTransactionsForCategory(categoryId, startDate, endDate);
        const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        await updateBudget(categoryId, budget.amount, budget.type);
        await checkBudgetNotifications(categories.find(cat => cat.id === categoryId)!.name, spent, budget.amount);
    }
  };

  const checkBudgetNotifications = async (categoryName: string, spent: number, budgetAmount: number) => {
    const percentageSpent = (spent / budgetAmount) * 100;
    const budgetNotificationsEnabled = JSON.parse(await AsyncStorage.getItem('budgetNotificationsEnabled') || 'true');

    if (!budgetNotificationsEnabled) {
      return;
    }

    if (percentageSpent >= 90 && percentageSpent < 100) {
      scheduleNotification(
        `Warning!`,
        `You've spent ${percentageSpent.toFixed(2)}% of your budget in the ${categoryName} category.`
      );
    } else if (percentageSpent >= 100) {
      scheduleNotification(
        `Exceeded Budget for ${categoryName}`,
        `You've spent more than your allocated budget in the ${categoryName} category.`
      );
    }
  };

  const scheduleNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  async function handleSave() {
    const transaction = {
      id: 0,
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: date.getTime(), // Use the selected date
      type: category as "Expense" | "Income",
    };

    await insertTransaction(transaction);
    await refreshBudget(transaction.category_id);
    setAmount("");
    setDescription("");
    setCategory("Expense");
    setCategoryId(1);
    setCurrentTab(0);
    setTypeSelected("");
    setDate(new Date()); // Reset date after saving
    Alert.alert("Success", "Transaction added successfully");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <TextInput
          placeholder="$Amount"
          style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, "");
            setAmount(numericValue);
          }}
        />
        <TextInput
          placeholder="Description"
          style={{ marginBottom: 15 }}
          value={description}
          onChangeText={setDescription}
        />
        <Text style={{ marginBottom: 6 }}>Select an entry type</Text>
        <SegmentedControl
          values={["Expense", "Income"]}
          style={{ marginBottom: 15 }}
          selectedIndex={currentTab}
          onChange={(event) => {
            setCurrentTab(event.nativeEvent.selectedSegmentIndex);
          }}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={{ marginBottom: 15, fontWeight: "bold" }}>
            {`Date: ${date.toDateString()}`}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || date;
              setShowDatePicker(false);
              setDate(currentDate);
            }}
          />
        )}
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            onPress={() => {
              setTypeSelected(cat.name);
              setCategoryId(cat.id);
            }}
            activeOpacity={0.6}
            style={{
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: typeSelected === cat.name ? "#007BFF20" : "#00000020",
              borderRadius: 15,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                color: typeSelected === cat.name ? "#007BFF" : "#000000",
                marginLeft: 5,
              }}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
});
