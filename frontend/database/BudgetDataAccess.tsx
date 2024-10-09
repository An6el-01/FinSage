import { useSQLiteContext } from "expo-sqlite";
import { TransactionsCategories, Budgets, Transactions, SavingsGoals } from "../types/types";

export const useGoalDataAccess = () => {
    const db = useSQLiteContext();

    const getCategories = async (): Promise<TransactionsCategories[]> => {
        const results = await db.getAllAsync<TransactionsCategories>('SELECT * FROM TransactionsCategories');
        return results;
    };

    const insertBudget = async (categoryId: number, amount: number, type: 'monthly' | 'weekly') => {
        await db.runAsync(
          `INSERT INTO Budgets (category_id, amount, type) VALUES (?, ?, ?);`,
          [categoryId, amount, type]
        );
      };

    const getBudgets = async (): Promise<Budgets[]> => {
        const results = await db.getAllAsync<Budgets>('SELECT * FROM Budgets');
        return results;
    };

    const updateBudget = async (categoryId: number, amount: number, type: 'monthly' | 'weekly') => {
        await db.runAsync(
            `UPDATE Budgets SET amount = ?, spent = (SELECT SUM(amount) FROM Transactions WHERE category_id = ? AND type = ?) WHERE category_id = ? AND type = ?;`,
            [amount, categoryId, type, categoryId, type]
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
