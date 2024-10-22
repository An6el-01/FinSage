import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons (e.g., Buy/Sell buttons)

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
  cardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  recommendationText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  riskText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  sentimentContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

const CryptoAIRecommendations = () => {
  const aiRecommendations = [
    {
      crypto: 'Bitcoin',
      recommendation: 'Buy',
      sentiment: 'Bullish',
      pricePrediction: 'Predicted Price: $48,000',
      risk: 'Moderate',
    },
    {
      crypto: 'Ethereum',
      recommendation: 'Sell',
      sentiment: 'Bearish',
      pricePrediction: 'Predicted Price: $3,200',
      risk: 'High',
    },
    {
      crypto: 'Cardano',
      recommendation: 'Hold',
      sentiment: 'Neutral',
      pricePrediction: 'Predicted Price: $2.50',
      risk: 'Low',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>AI Recommendations</Text>

      {/* Loop through each recommendation */}
      {aiRecommendations.map((item, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.crypto}</Text>
            <Text style={[styles.recommendationText, { color: item.recommendation === 'Buy' ? '#28a745' : item.recommendation === 'Sell' ? '#dc3545' : '#ffc107' }]}>
              {item.recommendation}
            </Text>
          </View>

          <Text style={styles.recommendationText}>{item.pricePrediction}</Text>

          <View style={styles.sentimentContainer}>
            <Ionicons name={item.sentiment === 'Bullish' ? 'arrow-up-outline' : item.sentiment === 'Bearish' ? 'arrow-down-outline' : 'remove-outline'} size={20} color={item.sentiment === 'Bullish' ? '#28a745' : item.sentiment === 'Bearish' ? '#dc3545' : '#ffc107'} />
            <Text style={[styles.sentimentText, { color: item.sentiment === 'Bullish' ? '#28a745' : item.sentiment === 'Bearish' ? '#dc3545' : '#ffc107' }]}>{item.sentiment}</Text>
          </View>

          <Text style={styles.riskText}>Risk: {item.risk}</Text>

          {/* Buy/Sell/Hold buttons */}
          <View style={styles.actionButtons}>
            {item.recommendation === 'Buy' && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Buy</Text>
              </TouchableOpacity>
            )}
            {item.recommendation === 'Sell' && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="cash-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Sell</Text>
              </TouchableOpacity>
            )}
            {item.recommendation === 'Hold' && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="hourglass-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Hold</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default CryptoAIRecommendations;
