import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { GoalForm } from '../../src/components/domain/GoalForm';
import { colors, spacing, type } from '../../src/theme';

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goals = useLifeStore((s) => s.goals);
  const updateGoal = useLifeStore((s) => s.updateGoal);
  const deleteGoal = useLifeStore((s) => s.deleteGoal);
  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);

  if (!goal) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Ziel nicht gefunden.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ziel bearbeiten</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <GoalForm
        initialGoal={goal}
        submitLabel="Änderungen speichern"
        onSubmit={(values) => {
          updateGoal(goal.id, values);
          router.back();
        }}
        onDelete={() => {
          deleteGoal(goal.id);
          router.dismissTo('/(tabs)/ziele');
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
  notFound: {
    ...type.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
