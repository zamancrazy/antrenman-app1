import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase, seedInitialData } from '@/src/database/db';
import { colors } from '@/src/theme/colors';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-warm icon assets for Expo Go Android
        await Asset.loadAsync([
          require('../assets/icon.png'),
          require('../assets/adaptive-icon.png'),
          require('../assets/favicon.png'),
        ]);

        // Initialize database
        await initDatabase();
        await seedInitialData();
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.neonGreen} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercise/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});