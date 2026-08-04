import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AreaKey } from '../../data/types';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

export function DomainHeader({ title, area, showBack = true }: { title: string; area: AreaKey; showBack?: boolean }) {
  const color = colors.area[area];
  return (
    <View style={styles.row}>
      {showBack ? (
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.badge, { backgroundColor: `${color}22` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.title1,
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
