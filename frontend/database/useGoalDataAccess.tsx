import { useSQLiteContext } from "expo-sqlite";
import { TransactionsCategories, Budgets, Transactions, SavingsGoals } from "../types/types";

export const useGoalDataAccess = () => {
    const db = useSQLiteContext();

    const getGoals = async (): Promise<SavingsGoals[]> => {
        const results = await db.getAllAsync<SavingsGoals>('SELECT * FROM SavingsGoals');
        return results;
    };

    const getCategories = async (): Promise<TransactionsCategories[]> => {
        const results = await db.getAllAsync<TransactionsCategories>('SELECT * FROM TransactionsCategories');
        return results;
    };

    const insertGoal = async (SavingsGoals: SavingsGoals) => {
        await db.runAsync(
            'INSERT INTO SavingsGoals (name, amount, progress) VALUES (?, ?, ?);',
            [SavingsGoals.name, SavingsGoals.amount, SavingsGoals.progress]
        );
    };

    const updateGoal = async (SavingsGoals: SavingsGoals) => {
        await db.runAsync(
            'UPDATE SavingsGoals SET name = ?, amount = ?, progress = ? WHERE id = ?;',
            [SavingsGoals.name, SavingsGoals.amount, SavingsGoals.progress, SavingsGoals.id]
        );
    };

    const deleteGoal = async (id: number) => {
        await db.runAsync('DELETE FROM SavingsGoals WHERE id = ?;', [id]);
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
        getGoals,
        getCategories,
        insertGoal,
        updateGoal,
        deleteGoal,
        insertBudget,
        getBudgets,
        deleteBudget,
        updateBudget,
        getTransactionsForCategory
    };
};
