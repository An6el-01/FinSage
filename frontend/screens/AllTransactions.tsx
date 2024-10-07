import * as React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from "expo-sqlite/next";
import TransactionsByMonth from '../components/AllTransactionsScreen/TransactionsByMonth';
import IncomeExpenseGraph from '../components/AllTransactionsScreen/IncomeExpenseGraph';
import { Transactions } from "../types/types";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

export default function AllTransactions() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = React.useState<Transactions[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  // Fetch transactions whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.settingsIcon} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="black" />
          <Text style={styles.settingsIconName}>Settings</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const result = await db.getAllAsync<Transactions>(
      `SELECT * FROM Transactions ORDER BY date DESC;`
    );
    setTransactions(result);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Render the Transactions grouped by month */}
      <IncomeExpenseGraph transactions={transactions} />
      <TransactionsByMonth transactions={transactions} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  settingsIcon: {
    alignItems: 'center',
    marginRight:  13,
  },
  settingsIconName: {
    marginTop: 3,
    fontSize: 12,
    color: '#212121',
  }
});
