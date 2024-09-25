// utils/dbUtils.ts
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the current database version
const DB_VERSION = "1.0"; // Increment this every time you update the database

export const checkAndCopyDatabase = async () => {
  const dbName = "mySQLiteDB.db"; // Database name
  const dbAsset = require("../assets/mySQLiteDB.db"); // Path to the database asset
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`; // Path to where the database will be copied

  // Get the current version of the database stored on the device
  const storedVersion = await AsyncStorage.getItem("DB_VERSION");

  if (storedVersion !== DB_VERSION) {
    // If no version is found or the versions do not match, update the database
    console.log("Updating database...");

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (fileInfo.exists) {
      // Delete the old database
      await FileSystem.deleteAsync(dbFilePath);
    }

    // Ensure the SQLite folder exists
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });

    // Copy the new database from assets
    const dbUri = Asset.fromModule(dbAsset).uri;
    await FileSystem.downloadAsync(dbUri, dbFilePath);

    // Update the stored version
    await AsyncStorage.setItem("DB_VERSION", DB_VERSION);
    console.log("Database updated to version:", DB_VERSION);
  } else {
    console.log("Database is up to date.");
  }
};
