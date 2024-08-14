
import { useSQLiteContext } from "expo-sqlite/next";
import { Transaction } from "../Misc/types";

// Fetch transaction data from SQLite database
export const fetchTransactionData = async () => {
  const db = useSQLiteContext();

  const transactions = await db.getAllAsync<Transaction>(`
    SELECT 
      Transactions.amount,
      Transactions.date,
      Categories.name AS category_name,
      Transactions.type
    FROM Transactions
    JOIN Categories ON Transactions.category_id = Categories.id
    ORDER BY Transactions.date DESC;
  `);

  return transactions;
};

// Preprocess the fetched transaction data
export const preprocessData = (transactions: Transaction[]) => {
    const groupedData = transactions.reduce((acc, transaction) => {
      // Ensure the date is valid and can be converted to a string format
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
  
      // Only proceed if the category_name is defined
      if (transaction.category_name) {
        if (!acc[monthYear]) {
          acc[monthYear] = {};
        }
  
        if (!acc[monthYear][transaction.category_name]) {
          acc[monthYear][transaction.category_name] = 0;
        }
  
        acc[monthYear][transaction.category_name] += transaction.amount;
      }
  
      return acc;
    }, {} as Record<string, Record<string, number>>);
  
    return groupedData;
  };
  
