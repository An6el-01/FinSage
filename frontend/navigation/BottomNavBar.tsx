import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/Home';
import TransactionsScreen from '../screens/Transactions';
import BudgetsScreen from '../screens/Budgets';
import CryptoPortfolioScreen from '../screens/CryptoPortfolio';

const Tab = createBottomTabNavigator();

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
};

export default function BottomNavBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'swap-vertical' : 'swap-vertical-outline';
          } else if (route.name === 'Budgets') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Crypto Portfolio') {
            iconName = focused ? 'logo-bitcoin' : 'logo-bitcoin';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ title: 'Budgets' }} />
      <Tab.Screen name="Crypto Portfolio" component={CryptoPortfolioScreen} options={{ title: 'Crypto' }} />
    </Tab.Navigator>
  );
}
