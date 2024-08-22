import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useSQLiteContext } from 'expo-sqlite/next';

interface Props {
  onClose: () => void;
}

interface Recommendation {
  content: string;
  impact: 'high' | 'medium' | 'low';
}

const SavingsRecommendations: React.FC<Props> = ({ onClose }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const db = useSQLiteContext();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
        const transactions = await fetchTransactionsFromDB();
        const categories = await fetchCategoriesFromDB();

        if (transactions.length === 0) {
            Alert.alert("No Data", "No transactions found in the database to analyze.");
            setLoading(false);
            return;
        }

        // Create a mapping of category_id to category_name
        const categoryMap = categories.reduce((map, category) => {
            map[category.id] = category.name;
            return map;
        }, {});

        // Transform transactions data to the format expected by the AI
        const transformedTransactions = transactions.map(transaction => ({
            amount: transaction.amount,
            date: transaction.date, // Using the milliseconds timestamp directly
            category_name: categoryMap[transaction.category_id] || 'Miscellaneous',
            type: transaction.type,
        }));

        // Log the transformed transactions
        console.log('Sending transformed transactions:', JSON.stringify(transformedTransactions, null, 2));

        // Update the URL to include the correct API endpoint
        const response = await axios.post('https://budgetbee-cxdt35ctpq-nw.a.run.app/api/recommendations', transformedTransactions);

        console.log('API response:', response.data);

        // Assuming the API now returns impact levels as well
        const detailedRecommendations = response.data.recommendations.map((rec: string) => {
            let impact: 'high' | 'medium' | 'low';
            if (rec.includes('Reduce Dining Out') || rec.includes('Cut Back on Leisure')) {
                impact = 'high';
            } else if (rec.includes('Energy Saving Tips') || rec.includes('Review Subscriptions')) {
                impact = 'medium';
            } else {
                impact = 'low';
            }
            return { content: rec, impact };
        });

        setRecommendations(detailedRecommendations);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching recommendations:', error.response ? error.response.data : error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        Alert.alert("Error", "Failed to fetch recommendations. Please try again later.");
    } finally {
        setLoading(false);
    }
};

  const fetchTransactionsFromDB = async (): Promise<any[]> => {
    try {
      return await db.getAllAsync('SELECT * FROM Transactions');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  const fetchCategoriesFromDB = async (): Promise<any[]> => {
    try {
      return await db.getAllAsync('SELECT * FROM Categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const RecommendationCard = ({ title, content, impact }: { title: string; content: string; impact: 'high' | 'medium' | 'low' }) => {
    let backgroundColor;
    if (impact === 'high') {
      backgroundColor = '#FF6347'; // Red for high impact
    } else if (impact === 'medium') {
      backgroundColor = '#FFD700'; // Yellow for medium impact
    } else {
      backgroundColor = '#32CD32'; // Green for low impact
    }

    return (
      <View style={[styles.card, { backgroundColor }]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardContent}>{content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Savings Recommendations</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color="#FCB900" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FCB900" style={styles.loadingIndicator} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {recommendations.length > 0 ? (
            recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={index}
                title={`Recommendation ${index + 1}`}
                content={recommendation.content}
                impact={recommendation.impact}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>No recommendations available at the moment.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCB900',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  scrollView: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardContent: {
    fontSize: 16,
    color: '#555',
  },
  noDataText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SavingsRecommendations;
