import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';

// Screens
import HomeScreen from '../screens/Home';
import TransactionsScreen from '../screens/Transactions';
import NewTransactionInput from '../components/AllTransactionsScreen/NewTransactionInput';
import TransactionDetails from '../components/AllTransactionsScreen/TransactionDetails';
import BudgetsScreen from '../screens/Budgets';
import CryptoPortfolioScreen from '../screens/CryptoPortfolio';
import Settings from '../screens/Settings';
import SavingsGoals from '../screens/SavingsGoals';
import Statistics from '../screens/Statistics';
import YearlySummary from '../screens/YearlySummary';
import AllTransactions from '../screens/AllTransactions';
import CryptoReports from '../components/CryptoPortfolioScreen/CryptoReports';
import CryptoAIRecommendations from '../components/CryptoPortfolioScreen/CryptoAIRecommendations';

const Tab = createBottomTabNavigator();
const StatsStack = createNativeStackNavigator<RootStackParamList>();
const CryptoStack = createNativeStackNavigator<RootStackParamList>();
const TransactionStack = createNativeStackNavigator<RootStackParamList>();

const colors = {
  primary: '#FCB900',
  secondary: '#F9A800',
  text: '#212121',
};

// Create a stack navigator for the Statistics screen and its child screens
const StatisticsNavigator = () => {
    return (
    <StatsStack.Navigator
    screenOptions={{
      headerShown: true, // Set to true to show the header
      headerStyle: { backgroundColor: "#ffff" }, // Optional: Customize header style
      headerTintColor: '#000000', // Optional: Customize header text color
      headerTitleStyle: { fontWeight: 'normal' }, // Optional: Customize title style
    }}
    >
      <StatsStack.Screen name="Statistics" component={Statistics} options={{ headerShown: false }}/>
      <StatsStack.Screen
       name="YearlySummary" 
       component={YearlySummary} 
       options={({ navigation }) => ({
         title: 'Go Back',
         headerLeft: () => (
           <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
             <Ionicons name="arrow-back" size={24} color="#000000" />
           </TouchableOpacity>
         ),
       })} 
      />
    </StatsStack.Navigator>
    )
  }

  const CryptoNavigator = () => {
    return(
      <CryptoStack.Navigator
      screenOptions={{
        headerShown: true, // Set to true to show the header
        headerStyle: { backgroundColor: "#ffff" }, // Optional: Customize header style
        headerTintColor: '#000000', // Optional: Customize header text color
        headerTitleStyle: { fontWeight: 'normal' }, // Optional: Customize title style
      }}
      >
        <CryptoStack.Screen name="CryptoPortfolio" component={CryptoPortfolioScreen} options={{ headerShown: false }}/>
        <CryptoStack.Screen name="CryptoReports" component={CryptoReports} options= {{title: ""}}/>
        <CryptoStack.Screen name="CryptoAIRecommendations" component={CryptoAIRecommendations} options ={{title: ""}}/>
      </CryptoStack.Navigator>
    )
  }

  const TransactionNavigator = () => {
    return(
      <TransactionStack.Navigator
      screenOptions={{
        headerShown: true, // Set to true to show the header
        headerStyle: { backgroundColor: "#ffff" }, // Optional: Customize header style
        headerTintColor: '#000000', // Optional: Customize header text color
        headerTitleStyle: { fontWeight: 'normal' }, // Optional: Customize title style
      }}
      >
        <TransactionStack.Screen name="AllTransactions" component={AllTransactions} options={{ headerShown: false}}/>
        <TransactionStack.Screen name="NewTransactionInput" component={NewTransactionInput} options= {{title: ""}}/>
        <TransactionStack.Screen name="TransactionDetails" component={TransactionDetails} options={{ title: "" }} /> 
      </TransactionStack.Navigator>
    )
  }



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
      <Tab.Screen name="Transactions" component={TransactionNavigator} options={{ title: 'Transactions' }} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ title: 'Budgets' }} />
      <Tab.Screen name="Crypto Portfolio" component={CryptoNavigator} options={{ title: 'Crypto' }} />

      {/* Hide the tab button for the settings and savings goals */}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarButton: () => null,
          title: 'Settings',
        }}
      />
      <Tab.Screen
        name="SavingsGoals"
        component={SavingsGoals}
        options={{
          tabBarButton: () => null,
          title: 'Savings Goals',
        }}
      />
      {/* Use the Statistics Stack here */}
      <Tab.Screen
        name="Statistics"
        component={StatisticsNavigator}
        options={{
          title: 'Statistics',
          tabBarButton: () => null, // Prevent this from showing a tab bar button
        }}
      />
      <Tab.Screen
        name="AllTransactions"
        component={AllTransactions}
        options={{
          title: 'Your Transactions',
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
