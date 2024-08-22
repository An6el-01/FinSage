import { useSQLiteContext } from "expo-sqlite";
import { Goal, Category, Budget, Transaction } from "../Misc/types";

export const useGoalDataAccess = () => {
    const db = useSQLiteContext();

    const getGoals = async (): Promise<Goal[]> => {
        const results = await db.getAllAsync<Goal>('SELECT * FROM Goals');
        return results;
    };

    const getCategories = async (): Promise<Category[]> => {
        const results = await db.getAllAsync<Category>('SELECT * FROM Categories');
        return results;
    };

    const insertGoal = async (goal: Goal) => {
        await db.runAsync(
            'INSERT INTO Goals (name, amount, progress) VALUES (?, ?, ?);',
            [goal.name, goal.amount, goal.progress]
        );
    };

    const updateGoal = async (goal: Goal) => {
        await db.runAsync(
            'UPDATE Goals SET name = ?, amount = ?, progress = ? WHERE id = ?;',
            [goal.name, goal.amount, goal.progress, goal.id]
        );
    };

    const deleteGoal = async (id: number) => {
        await db.runAsync('DELETE FROM Goals WHERE id = ?;', [id]);
    };
    
    

    const insertBudget = async (categoryId: number, amount: number, type: 'monthly' | 'weekly') => {
        await db.runAsync(
          `INSERT INTO Budgets (category_id, amount, type) VALUES (?, ?, ?);`,
          [categoryId, amount, type]
        );
      };

    const getBudgets = async (): Promise<Budget[]> => {
        const results = await db.getAllAsync<Budget>('SELECT * FROM Budgets');
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
    
    const getTransactionsForCategory = async (categoryId: number, startDate: Date, endDate: Date): Promise<Transaction[]> => {
        const results = await db.getAllAsync<Transaction>(
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
