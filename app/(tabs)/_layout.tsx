import { Tabs } from 'expo-router';
import React from 'react';
import { TabBar } from '../../src/components/ui';

export default function TabsLayout() {
  return <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false, lazy: true }}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
    <Tabs.Screen name="plan" options={{ title: 'My plan' }} />
  </Tabs>;
}

