import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { GoalForm } from '../../src/components/domain/GoalForm';
import { AreaKey } from '../../src/data/types';
import { colors, spacing, type } from '../../src/theme';

export default function NewGoalScreen() {
  const { area } = useLocalSearchParams<{ area?: AreaKey }>();
  const addGoal = useLifeStore((s) => s.addGoal);
  const goals = useLifeStore((s) => s.goals);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Neues Ziel</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <GoalForm
        presetArea={area}
        existingGoals={goals}
        submitLabel="Ziel anlegen"
        onSubmit={(values) => {
          addGoal({ ...values, status: 'active', progress: 0 });
          router.back();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...type.title1,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
