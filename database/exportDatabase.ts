import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function exportDatabase() {
    const dbPath = `${FileSystem.documentDirectory}SQLite/mySQLiteDB.db`;
    const exportPath = `${FileSystem.documentDirectory}mySQLiteDB_exported.db`;

    await FileSystem.copyAsync({
        from: dbPath,
        to: exportPath,
    });

    console.log('Database copied to:', exportPath);

    // Open the share dialog to share the exported database
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportPath);
    } else {
        console.log("Sharing is not available on this device");
    }
}
exportDatabase();