import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCatalogStore } from '../src/state/useCatalogStore';

export default function RootLayout() {
  // Download the latest program catalog in the background. The app renders the
  // bundled copy immediately and swaps in the newer one when it arrives.
  useEffect(() => { void useCatalogStore.getState().refresh(); }, []);
  return <SafeAreaProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} /></SafeAreaProvider>;
}
