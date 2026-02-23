import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DevicesScreen } from '../screens/devices/DevicesScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Devices" component={DevicesScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
