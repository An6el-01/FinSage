// frontend/components/HomeScreen/AIInsights.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AiInsights = () => {
  // Placeholder data for AI insights. Replace with actual logic later.
  const aiRecommendations = [
    "Reduce your dining expenses by 10% to save more.",
    "Consider setting aside 5% of your income for investments."
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Insights</Text>
      {aiRecommendations.map((insight, index) => (
        <Text key={index} style={styles.text}>{insight}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AiInsights;
