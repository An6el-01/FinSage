import axios from 'axios';
import * as React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

const colors = {
  primary: "#FCB900",
  text: "#212121",
  background: "#F5F5F5",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
  },
  recommendation: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
  },
});

type SavingsRecommendationsProps = {
  onClose: () => void;
}

const SavingsRecommendations: React.FC<SavingsRecommendationsProps> = ({ onClose }) => {
  const [recommendations, setRecommendations] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Replace with the actual path to your API
        const response = await axios.post('http://127.0.0.1:8000/predict', [
          {
            amount: 100,
            date: Date.now(),
            category_name: 'Groceries',
            type: 'Expense'
          }
          // Add more mock data as needed
        ]);
        
        setRecommendations(response.data.predictions);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SimpleLineIcons name="magic-wand" size={32} color={colors.primary} />
        <Text style={styles.headerText}>Savings Recommendations</Text>
      </View>
      <ScrollView>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendation}>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.closeButton}>
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  );
};

export default SavingsRecommendations;
