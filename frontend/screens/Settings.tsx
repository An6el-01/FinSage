import * as React from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    padding: 15,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  switchText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const Settings = ({ navigation }: { navigation: any }) => {
  const [isBudgetNotificationsEnabled, setIsBudgetNotificationsEnabled] = React.useState<boolean>(false);
  const [isGoalNotificationsEnabled, setIsGoalNotificationsEnabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const savedBudgetSetting = await AsyncStorage.getItem('budgetNotificationsEnabled');
      const savedGoalSetting = await AsyncStorage.getItem('goalNotificationsEnabled');

      if (savedBudgetSetting !== null) {
        setIsBudgetNotificationsEnabled(JSON.parse(savedBudgetSetting));
      }
      if (savedGoalSetting !== null) {
        setIsGoalNotificationsEnabled(JSON.parse(savedGoalSetting));
      }
    };

    loadSettings();
  }, []);

  const toggleBudgetNotifications = async () => {
    const newValue = !isBudgetNotificationsEnabled;
    setIsBudgetNotificationsEnabled(newValue);
    await AsyncStorage.setItem('budgetNotificationsEnabled', JSON.stringify(newValue));
  };

  const toggleGoalNotifications = async () => {
    const newValue = !isGoalNotificationsEnabled;
    setIsGoalNotificationsEnabled(newValue);
    await AsyncStorage.setItem('goalNotificationsEnabled', JSON.stringify(newValue));
  };

  const handleLogout = async () => {
    // Confirm logout action
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          // Remove the login status from AsyncStorage
          await AsyncStorage.setItem('isLoggedIn', 'false');
          // Navigate to the Login screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Enable Budget Notifications</Text>
        <Switch
          value={isBudgetNotificationsEnabled}
          onValueChange={toggleBudgetNotifications}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Enable Goal Contribution Notifications</Text>
        <Switch
          value={isGoalNotificationsEnabled}
          onValueChange={toggleGoalNotifications}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button
          title="Logout"
          color={colors.primary}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

export default Settings;
