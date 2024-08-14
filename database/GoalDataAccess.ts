import { useSQLiteContext } from "expo-sqlite/next";
import { Goal } from "../Misc/types";

export const useGoalDataAccess = () => {
  const db = useSQLiteContext();

  const getGoals = async (): Promise<Goal[]> => {
    const results = await db.getAllAsync<Goal>(`SELECT * FROM Goals;`);
    return results;
  };

  const insertGoal = async (goal: Goal) => {
    await db.runAsync(
      `INSERT INTO Goals (name, amount, progress) VALUES (?, ?, ?);`,
      [goal.name, goal.amount, goal.progress]
    );
  };

  const updateGoal = async (goal: Goal) => {
    await db.runAsync(
      `UPDATE Goals SET name = ?, amount = ?, progress = ? WHERE id = ?;`,
      [goal.name, goal.amount, goal.progress, goal.id]
    );
  };

  const deleteGoal = async (id: number) => {
    await db.runAsync(`DELETE FROM Goals WHERE id = ?;`, [id]);
  };

  const depositGoal = async (goal: Goal, amount:number) => {
    await db.runAsync(
      `UPDATE Goals SET progress = progress + ? WHERE id = ?;`,
      [amount, goal.id]
    );
  };

  return {
    getGoals,
    insertGoal,
    updateGoal,
    deleteGoal,
    depositGoal,
  };
};
