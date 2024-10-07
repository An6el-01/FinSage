import { useSQLiteContext } from "expo-sqlite/next";
import { SavingsGoals } from "../types/types";

export const useGoalDataAccess = () => {
  const db = useSQLiteContext();

  const getGoals = async (): Promise<SavingsGoals[]> => {
    const results = await db.getAllAsync<SavingsGoals>(`SELECT * FROM SavingsGoals;`);
    return results;
  };

  const insertGoal = async (SavingsGoals: SavingsGoals) => {
    await db.runAsync(
      `INSERT INTO SavingsGoals (name, amount, progress) VALUES (?, ?, ?);`,
      [SavingsGoals.name, SavingsGoals.amount, SavingsGoals.progress]
    );
  };

  const updateGoal = async (SavingsGoals: SavingsGoals) => {
    await db.runAsync(
      `UPDATE Goals SET name = ?, amount = ?, progress = ? WHERE id = ?;`,
      [SavingsGoals.name, SavingsGoals.amount, SavingsGoals.progress, SavingsGoals.id]
    );
  };

  const deleteGoal = async (id: number) => {
    await db.runAsync(`DELETE FROM SavingsGoals WHERE id = ?;`, [id]);
  };

  const depositGoal = async (SavingsGoals: SavingsGoals, amount:number) => {
    await db.runAsync(
      `UPDATE Goals SET spent = spent + ? WHERE id = ?;`,
      [amount, SavingsGoals.id]
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
