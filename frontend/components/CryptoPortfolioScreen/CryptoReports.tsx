import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // Placeholder for graphs
import { Dimensions } from 'react-native';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
    textAlign: 'center',
  },
  graphContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  metricText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745', // Green color for positive values
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const CryptoReports = () => {
  // Placeholder data for graphs
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [10000, 12000, 14000, 13000, 15000, 16000],
        color: () => `rgba(40, 167, 69, 1)`, // Green line for growth
      },
    ],
    legend: ['Portfolio Value'], // Labels for graphs
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Crypto Performance Report</Text>

      {/* Performance Overview */}
      <View style={styles.overviewContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricText}>Portfolio Change</Text>
          <Text style={styles.metricValue}>+15%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricText}>Top Asset</Text>
          <Text style={styles.metricValue}>Bitcoin</Text>
        </View>
      </View>

      {/* Graph for Price Trends */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Portfolio Value Over Time</Text>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 40} // Dynamically adjust graph width
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 2,
            color: () => `rgba(0, 0, 0, 0.6)`,
            labelColor: () => `rgba(0, 0, 0, 0.6)`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#28a745', // Green dots for portfolio value
            },
          }}
          style={{
            marginVertical: 10,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
          bezier
          fromZero
        />
      </View>

      {/* Filters for Time Range */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>1 Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>1 Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>1 Year</Text>
        </TouchableOpacity>
      </View>

      {/* Profit/Loss Breakdown */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Profit/Loss Breakdown</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                data: [-500, 1000, 1500, -200, 2500, 3000], // Placeholder profit/loss data
                color: () => `rgba(220, 53, 69, 1)`, // Red for loss
              },
            ],
            legend: ['Profit/Loss'],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 2,
            color: () => `rgba(0, 0, 0, 0.6)`,
            labelColor: () => `rgba(0, 0, 0, 0.6)`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#dc3545', // Red dots for loss
            },
          }}
          style={{
            marginVertical: 10,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
          bezier
          fromZero
        />
      </View>
    </ScrollView>
  );
};

export default CryptoReports;
