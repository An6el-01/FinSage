import * as React from 'react';
import { Category, Transaction } from '../types/types';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import TransactionListItem from './TransactionListItem';

export default function TransactionList({
  transactions,
  categories,
  deleteTransaction,
}: {
  categories: Category[];
  transactions: Transaction[];
  deleteTransaction: (id: number) => Promise<void>;
}) {
  return (
    <View>
      {transactions.map((transaction) => {
        const categoryForCurrentItem = categories.find(
          (category) => category.id === transaction.category_id
        );
        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onLongPress={() => {
              // Prompt to confirm deletion before calling deleteTransaction
              Alert.alert(
                'Delete Transaction',
                `Are you sure you want to delete transaction "${transaction.description}"?`,
                [
                  { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                  {
                    text: 'Delete',
                    onPress: async () => {
                      await deleteTransaction(transaction.id);
                    },
                    style: 'destructive',
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <TransactionListItem 
              transaction={transaction} 
              categoryInfo={categoryForCurrentItem}/>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
