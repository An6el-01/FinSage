import * as React from 'react';
import { TransactionsCategories, Transactions } from '../types/types';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import TransactionListItem from './TransactionListItem';
import { useSQLiteContext } from 'expo-sqlite/next'; // Import your database context

export default function TransactionList({
  transactions,
  categories,
  deleteTransaction,
}: {
  categories: TransactionsCategories[]; // Categories prop if passed
  transactions: Transactions[]; // List of transactions
  deleteTransaction: (id: number) => Promise<void>;
}) {
  const [categoriesFromDB, setCategoriesFromDB] = React.useState<TransactionsCategories[]>([]); // State to store categories from the DB
  const db = useSQLiteContext(); // Use SQLite DB context

  // Fetch categories from the database if not passed
  React.useEffect(() => {
    if (categories.length === 0) {
      // If no categories are passed, fetch from the database
      fetchCategoriesFromDB();
    }
  }, [categories]);

  const fetchCategoriesFromDB = async () => {
    try {
      const result = await db.getAllAsync<TransactionsCategories>(`SELECT * FROM TransactionsCategories;`);
      setCategoriesFromDB(result); // Set the categories fetched from DB
    } catch (error) {
      console.error('Error fetching categories:', error); // Handle any errors in fetching
    }
  };

  // Use the passed categories or fallback to categories fetched from the database
  const availableCategories = categories.length > 0 ? categories : categoriesFromDB;

  return (
    <View>
      {transactions.map((transaction) => {
        // Find the category for the current transaction
        const categoryForCurrentItem = availableCategories.find(
          (category) => String(category.id) === String(transaction.category_id)
        );

        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onLongPress={() => {
              Alert.alert(
                'Delete Transaction',
                `Are you sure you want to delete transaction "${transaction.description}"?`,
                [
                  { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                  {
                    text: 'Delete',
                    onPress: async () => {
                      await deleteTransaction(transaction.id);
                    },
                    style: 'destructive',
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <TransactionListItem
              transaction={transaction}
              categoryInfo={categoryForCurrentItem} // Pass the correct category
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
