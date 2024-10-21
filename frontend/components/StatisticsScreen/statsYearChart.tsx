import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatsYearChartProps } from '../../types/types';

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
  background: '#F5F5F5',
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.text,
  },
  tooltipContainer: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 9999,
    top: -40,
    left: -30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toolTipText:{
    fontWeight: 'bold',
    color: "#333",
  },
}
);


const StatsYearChart: React.FC<StatsYearChartProps> = ({ incomeData, expensesData }) => {
  const [tooltipData, setTooltipData] = React.useState<{ value: number, label: string, x: number, y: number} | null>(null);
  const chartData = {
    labels: ['Jan'," "," "," "," ", " "," ", " "," "," "," ",'Dec'],
    datasets: [
      {
        data: incomeData,
        color: () => '#28a745', // Green for income
      },
      {
        data: expensesData,
        color: () => '#dc3545', // Red for expenses
      },
    ],
    legend: ['Income', 'Expenses'],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Income vs Expenses</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#f5f5f5',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{
          borderRadius: 16,
        }}
        verticalLabelRotation={0}
        //Touch Event Handling
        onDataPointClick={({ value, index, x, y}) => {
          const label = chartData.labels[index];
          setTooltipData({ value, label, x, y});
          
        }}
        fromZero
      />

      {tooltipData && (
        <View style={[styles.tooltipContainer, {top: tooltipData.y + 38, left: tooltipData.x + 11}]}>
          <Text style={styles.toolTipText}>{`${tooltipData.label}: $${tooltipData.value}`}</Text>
        </View>
      )}
    </View>
  );
};

export default StatsYearChart;
