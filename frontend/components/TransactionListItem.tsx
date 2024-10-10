import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { TransactionsCategories, Transactions } from "../types/types";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import { categoryColors, categoryEmojies } from "../types/constants";
import Card from "./ui/Card";

interface TransactionListItemProps {
  transaction: Transactions;
  categoryInfo: TransactionsCategories | undefined;
}

export default function TransactionListItem({
  transaction,
  categoryInfo,
}: TransactionListItemProps) {
  // Ensure the category name exists and is properly mapped
  const iconName = transaction.type === "Expense" ? "minuscircle" : "pluscircle";
  const color = transaction.type === "Expense" ? "red" : "green";

  // Fetch the color and emoji using category name, and default to "Miscellaneous" if not found
  const categoryName = categoryInfo?.name ?? "Miscellaneous";
  const categoryColor = categoryColors[categoryName] ?? "#DB7093";  // Default to PaleVioletRed (Miscellaneous)
  const emoji = categoryEmojies[categoryName] ?? "❔";  // Default to question mark for unknown categories


  return (
    <Card style={[styles.card, { backgroundColor: categoryColor + "40" }]}>
      <View style={styles.row}>
        <View style={{ width: "40%", gap: 3 }}>
          <Amount amount={transaction.amount} color={color} iconName={iconName} />
        </View>
        {/* Pass the category name and emoji to TransactionInfo */}
        <TransactionInfo
          date={transaction.date}
          description={transaction.description}
          categoryName={categoryName}
          emoji={emoji}
        />
      </View>
    </Card>
  );
}

function TransactionInfo({
  date,
  description,
  categoryName,
  emoji,
}: {
  date: number;
  description: string;
  categoryName: string;
  emoji: string;
}) {
  // Convert the date from milliseconds to seconds if necessary
  const formattedDate = new Date(date > 9999999999 ? date / 1000 : date).toDateString();

  return (
    <View style={{ flexGrow: 1, gap: 6, flexShrink: 1 }}>
      <Text style={styles.description}>{description}</Text>
      {/* Display the emoji and category name side by side */}
      <View style={styles.categoryRow}>
        <Text style={styles.categoryName}>
          {emoji} {categoryName}
        </Text>
      </View>
      <Text style={styles.date}>{formattedDate}</Text>
    </View>
  );
}


function Amount({
  iconName,
  color,
  amount,
}: {
  iconName: "minuscircle" | "pluscircle";
  color: string;
  amount: number;
}) {
  return (
    <View style={styles.row}>
      <AntDesign name={iconName} size={18} color={color} />
      <AutoSizeText fontSize={24} mode={ResizeTextMode.max_lines} numberOfLines={1} style={styles.amount}>
        ${amount.toFixed(2)}
      </AutoSizeText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
  },
  amount: {
    fontSize: 24,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    fontWeight: "bold",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    fontSize: 10,
    color: "gray",
  },
});
