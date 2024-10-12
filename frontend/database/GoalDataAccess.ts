import { useSQLiteContext } from "expo-sqlite/next";
import { SavingsGoals } from "../types/types";

export const useGoalDataAccess = () => {
  const db = useSQLiteContext();

  const getGoals = async (): Promise<SavingsGoals[]> => {
    const results = await db.getAllAsync<SavingsGoals>('SELECT * FROM SavingsGoals');
    return results;
};

  const insertGoal = async (goal: SavingsGoals) => {
    console.log('Inserting goal with user_id:', goal.user_id);
    await db.runAsync(
        'INSERT INTO SavingsGoals (user_id, name, amount, progress, target_date) VALUES (?, ?, ?, ?, ?);',
        [goal.user_id, goal.name, goal.amount, goal.progress, goal.target_date]
    );        
};

const updateGoal = async (goal: SavingsGoals) => {
  await db.runAsync(
      'UPDATE SavingsGoals SET name = ?, amount = ?, progress = ?, target_date = ? WHERE id = ?;',
      [goal.name, goal.amount, goal.progress, goal.target_date, goal.id]
  );
};


const deleteGoal = async (id: number) => {
  await db.runAsync('DELETE FROM SavingsGoals WHERE id = ?;', [id]);
};



  const depositGoal = async (SavingsGoals: SavingsGoals, amount:number) => {
    await db.runAsync(
      `UPDATE Goals SET spent = spent + ? WHERE id = ?;`,
      [amount, SavingsGoals.id]
    );
  };
  const updateGoalFavorite = async (id: number, favorite: boolean) => {
    return await db.runAsync(
      'UPDATE SavingsGoals SET favorite = ? WHERE id = ?',
      [favorite ? 1 : 0, id]
    );
  };
  

  return {
    getGoals,
    insertGoal,
    updateGoal,
    deleteGoal,
    depositGoal,
    updateGoalFavorite,
  };
};
