import { useSQLiteContext } from "expo-sqlite";
import { Goal, Category } from "../types";

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

    const depositGoal = async (goal: Goal, amount: number) => {
        await db.runAsync(
            'UPDATE Goals SET progress = progress + ? WHERE id = ?;',
            [amount, goal.id]
        );
    };

    return {
        getGoals,
        getCategories,
        insertGoal,
        updateGoal,
        deleteGoal,
        depositGoal,
    };
};
