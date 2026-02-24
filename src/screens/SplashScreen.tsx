import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { APP_NAME } from '@/config/constants';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{APP_NAME}</Text>
      <ActivityIndicator
        size="large"
        color={isDark ? '#60a5fa' : '#2563eb'}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  titleDark: {
    color: '#f9fafb',
  },
  spinner: {
    marginTop: 16,
  },
});
