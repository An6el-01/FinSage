import { useSQLiteContext } from "expo-sqlite";
import { TransactionsCategories, Budgets, Transactions, SavingsGoals } from "../../types/types";

export const useGoalDataAccess = () => {
    const db = useSQLiteContext();

    const getCategories = async (): Promise<TransactionsCategories[]> => {
        const results = await db.getAllAsync<TransactionsCategories>('SELECT * FROM TransactionsCategories');
        return results;
    };

    const insertBudget = async (userId: number, categoryId: number, amount: number, type: 'monthly' | 'weekly') => {
        const currentTimestamp = Date.now();
        await db.runAsync(
          `INSERT INTO Budgets (user_id, category_id, amount, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`,
          [userId, categoryId, amount, type, currentTimestamp, currentTimestamp]
        );
      };

    const getBudgets = async (): Promise<Budgets[]> => {
        const results = await db.getAllAsync<Budgets>('SELECT * FROM Budgets');
        return results;
    };

    const updateBudget = async (categoryId: number, amount: number, type: 'monthly' | 'weekly') => {
        const currentTimestamp = Date.now(); // Get the current timestamp
        await db.runAsync(
            `UPDATE Budgets SET amount = ?, spent = (SELECT SUM(amount) FROM Transactions WHERE category_id = ? AND type = ?), updated_at = ? WHERE category_id = ? AND type = ?;`,
            [amount, categoryId, type, currentTimestamp, categoryId, type]
        );
    };    

    const deleteBudget = async (categoryId: number, type: 'monthly' | 'weekly') => {
        await db.runAsync(
            `DELETE FROM Budgets WHERE category_id = ? AND type = ?;`,
            [categoryId, type]
        );
    };
    
    const getTransactionsForCategory = async (categoryId: number, startDate: Date, endDate: Date): Promise<Transactions[]> => {
        const results = await db.getAllAsync<Transactions>(
            'SELECT * FROM Transactions WHERE category_id = ? AND date BETWEEN ? AND ?',
            [categoryId, startDate.getTime(), endDate.getTime()]
        );
        return results;
    };
      
    return {
        getCategories,
        insertBudget,
        getBudgets,
        deleteBudget,
        updateBudget,
        getTransactionsForCategory
    };
};
