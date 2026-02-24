import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DevicesScreen } from '@/screens/devices/DevicesScreen';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { useSettingsStore } from '@/stores';
import { lightTheme, darkTheme } from '@/config/theme';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const { theme: themePreference } = useSettingsStore();
  const systemColorScheme = useColorScheme();

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator>
        <Tab.Screen name="Devices" component={DevicesScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
