import React from 'react';
import { Tabs } from 'expo-router/tabs';
import { TabBar } from '../../src/components/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="ziele" options={{ title: 'Ziele' }} />
      <Tabs.Screen name="ki" options={{ title: 'KI' }} />
      <Tabs.Screen name="statistiken" options={{ title: 'Statistiken' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
