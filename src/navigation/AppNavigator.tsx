import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { LocationsListScreen } from '@/screens/locations/LocationsListScreen';
import { CategoriesListScreen } from '@/screens/categories/CategoriesListScreen';
import { LocationServicesScreen } from '@/screens/services/LocationServicesScreen';
import { CategoryServicesScreen } from '@/screens/services/CategoryServicesScreen';
import { ServiceDetailScreen } from '@/screens/services/ServiceDetailScreen';
import { useSettingsStore } from '@/stores';
import { lightTheme, darkTheme } from '@/config/theme';
import { useTranslation } from 'react-i18next';
import type { LocationsStackParamList, CategoriesStackParamList } from './types';

const Tab = createBottomTabNavigator();
const LocationsStack = createNativeStackNavigator<LocationsStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();

function LocationsStackNavigator() {
  const { t } = useTranslation();
  return (
    <LocationsStack.Navigator>
      <LocationsStack.Screen
        name="LocationsList"
        component={LocationsListScreen}
        options={{ title: t('tabs.locations') }}
      />
      <LocationsStack.Screen
        name="LocationServices"
        component={LocationServicesScreen}
        options={({ route }) => ({ title: route.params.locationName })}
      />
      <LocationsStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={({ route }) => ({ title: route.params.serviceName })}
      />
    </LocationsStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  const { t } = useTranslation();
  return (
    <CategoriesStack.Navigator>
      <CategoriesStack.Screen
        name="CategoriesList"
        component={CategoriesListScreen}
        options={{ title: t('tabs.categories') }}
      />
      <CategoriesStack.Screen
        name="CategoryServices"
        component={CategoryServicesScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <CategoriesStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen as any}
        options={({ route }) => ({ title: route.params.serviceName })}
      />
    </CategoriesStack.Navigator>
  );
}

export function AppNavigator() {
  const { t } = useTranslation();
  const { theme: themePreference } = useSettingsStore();
  const systemColorScheme = useColorScheme();

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="LocationsTab"
          component={LocationsStackNavigator}
          options={{ title: t('tabs.locations') }}
        />
        <Tab.Screen
          name="CategoriesTab"
          component={CategoriesStackNavigator}
          options={{ title: t('tabs.categories') }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={OrdersScreen}
          options={{ title: t('tabs.orders'), headerShown: true }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{ title: t('tabs.settings'), headerShown: true }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
