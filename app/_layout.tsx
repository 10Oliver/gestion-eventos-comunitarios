import { Stack } from 'expo-router';
import React from 'react';
import { initializeDatabase } from '../lib/db';

export default function RootLayout() {
  React.useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="oauth2redirect/google" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
