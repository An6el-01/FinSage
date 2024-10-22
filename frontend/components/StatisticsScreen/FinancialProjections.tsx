import * as React from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  chartContainer: {
    marginVertical: 20,
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  card: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  contentContainer: {
  paddingBottom: 30,
  },
});

const FinancialProjections = () => {
  // Placeholder data for the chart
  const projectionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [2000, 2400, 2200, 2600, 2700, 3000, 2800, 3100, 2900, 3200, 3300, 3400],
        color: () => '#28a745', // Green for income projection
      },
      {
        data: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600],
        color: () => '#dc3545', // Red for expense projection
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={{flex:1}}>
    <View style={styles.container}>
     <Text style={styles.text}>Financial Projections</Text>

      {/* Projected Income vs Expenses */}
      <View style={styles.chartContainer}>
        <Text style={styles.cardTitle}>Projected Income vs Expenses</Text>
        <LineChart
          data={projectionData}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </View>

      {/* AI Insights */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI-Powered Insights</Text>
        <Text style={styles.cardText}>
          "Based on your current spending pattern, you are projected to save $500 more by the end of the year."
        </Text>
      </View>

      {/* What-If Scenario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What-If Scenarios</Text>
        <Text style={styles.cardText}>
          "What if you saved an additional $100 each month? See how this impacts your future financials."
        </Text>
        <Button title="Simulate Scenarios" onPress={() => Alert.alert('Scenario Simulation Coming Soon')} />
      </View>

      {/* Savings Goals Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Savings Goals Progress</Text>
        <Text style={styles.cardText}>You are on track to reach your savings goal by December 2024.</Text>
      </View>

      {/* Projected Net Worth */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Projected Net Worth</Text>
        <Text style={styles.cardText}>
          Based on your current income and expenses, your net worth is projected to increase by $15,000 by the end of
          next year.
        </Text>
      </View>

      {/* CTA Button */}
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Explore Full Projections</Text>
      </View>
    </View>
    </ScrollView>
  );
};

export default FinancialProjections;
