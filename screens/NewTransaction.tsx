import * as React from 'react';
import { ScrollView, View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Card from '../components/ui/Card';
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useSQLiteContext } from 'expo-sqlite/next';
import { Category, Transaction } from '../types';

export default function NewTransaction() {
  const db = useSQLiteContext();
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("Expense");
  const [categoryId, setCategoryId] = React.useState<number>(1);

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

  async function handleSave() {
    await insertTransaction({
      id: 0, // Temporary id as placeholder
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: category as "Expense" | "Income",
    });
    setAmount("");
    setDescription("");
    setCategory("Expense");
    setCategoryId(1);
    setCurrentTab(0);
    setTypeSelected("");
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
