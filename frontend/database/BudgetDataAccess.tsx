import { useSQLiteContext } from "expo-sqlite";
import { TransactionsCategories, Budgets, Transactions, SavingsGoals } from "../types/types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth} from 'date-fns';

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
    const updateBudgetFavorite = async (id: number, favorite: boolean) => {
        return await db.runAsync(
          'UPDATE Budgets SET favorite = ? WHERE id = ?',
          [favorite ? 1 : 0, id]
        );
      };

      const refreshBudget = async (categoryId: number, budgetType: 'monthly' | 'weekly') => {
        try {
            const startDate = budgetType === 'weekly' ? startOfWeek(new Date()) : startOfMonth(new Date());
            const endDate = budgetType === 'weekly' ? endOfWeek(new Date()) : endOfMonth(new Date());
            const transactions = await getTransactionsForCategory(categoryId, startDate, endDate);
            
            // Calculate the total amount spent in the category for the specified time period
            const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            
            // Update the budget with the new spent value
            await updateBudget(categoryId, totalSpent, budgetType);
            
            console.log(`Budget refreshed for category ${categoryId}, total spent: ${totalSpent}`);
        } catch (error) {
            console.error(`Failed to refresh budget for category ${categoryId}:`, error);
        }
    };
      
    return {
        getCategories,
        insertBudget,
        getBudgets,
        deleteBudget,
        updateBudget,
        getTransactionsForCategory,
        updateBudgetFavorite,
        refreshBudget
    };
};
