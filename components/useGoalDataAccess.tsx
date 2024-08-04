import { useSQLiteContext } from "expo-sqlite";
import { Goal, SubGoal } from "../types";

export const useGoalDataAccess = () => {
    const db = useSQLiteContext();

    const getGoals = async (): Promise<Goal[]> => {
        const results = await db.getAllAsync<Goal>('SELECT * FROM Goals');
        for (let goal of results){
            const subGoals = await db.getAllAsync<SubGoal>("SELECT * FROM SubGoals WHERE goalId = ?;", [goal.id]);
            goal.subGoals = subGoals;
        }
        return results;
    };

    const insertGoal = async (goal:Goal) => {
        await db.runAsync(
            'INSERT INTO Goals (name, amount, progress) VALUES (?, ?, ?);',
            [goal.name, goal.amount, goal.progress]
        );
    };

    const updateGoal = async (goal: Goal) => {
        await db.runAsync(
            'UPDATE Goal SET name = ?, amount = ?, progress = ? WHERE id = ?;',
            [goal.name, goal.amount, goal.progress, goal.id]
        );
    };

    const deleteGoal = async (id: number) => {
        await db.runAsync('DELETE FROM Goals WHERE id = ?;', [id]);
    };

    const depositGoal = async (goal: Goal, amount:number) => {
        await db.runAsync(
            'UPDATE Goals SET progress = progress + ? WHERE id =?;',
            [amount, goal.id]
        );
    };

    const insertSubGoal = async (subGoal: SubGoal) => {
        await db.runAsync(
            'INSERT INTO SubGoals (goalId, name, amount, progress) VALUES (?, ?, ?, ?);',
            [subGoal.id, subGoal.name, subGoal.amount, subGoal.progress]
        );
    };

    const updateSubGoal = async (subGoal: SubGoal) => {
        await db.runAsync(
        'UPDATE SubGoals SET name = ?, amount = ?, progress = ? WHERE id = ?;',
        [subGoal.name, subGoal.amount, subGoal.progress, subGoal.id]
        );
    };

    const deleteSubGoal = async (id: number) => {
        await db.runAsync('DELETE FROM SubGoals WHERE id = ?;', [id]);
    };

    return {
        getGoals,
        insertGoal,
        updateGoal,
        deleteGoal,
        depositGoal,
        insertSubGoal,
        updateSubGoal,
        deleteSubGoal,
    };
};