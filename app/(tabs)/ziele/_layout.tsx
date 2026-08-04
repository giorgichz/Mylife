import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function ZieleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'ios_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ausbildung" />
      <Stack.Screen name="psyche" />
      <Stack.Screen name="geld" />
      <Stack.Screen name="fuehrerschein" />
    </Stack>
  );
}
