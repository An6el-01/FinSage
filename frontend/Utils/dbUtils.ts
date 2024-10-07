// utils/dbUtils.ts
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const checkAndCopyDatabase = async () => {
  const dbName = "mySQLiteDB.db"; // Database name
  const dbAsset = require("../assets/mySQLiteDB.db"); // Path to the database asset
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`; // Path to where the database will be copied

  try {
    // Always delete the existing database if it exists
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (fileInfo.exists) {
      console.log("Deleting old database...");
      await FileSystem.deleteAsync(dbFilePath, { idempotent: true }); // Set idempotent to avoid errors if the file doesn't exist
      console.log("Old database deleted.");
    }

    // Ensure the SQLite folder exists
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });

    // Copy the new database from assets
    const dbUri = Asset.fromModule(dbAsset).uri;
    console.log("Copying new database from assets...");
    await FileSystem.downloadAsync(dbUri, dbFilePath);
    console.log("New database copied successfully.");

    
  } catch (error) {
    console.error("Error updating database:", error);
  }
};
