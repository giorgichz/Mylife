import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, Pill, Button } from '../../src/components/ui';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AREA_ICONS, AREA_LABELS } from '../../src/data/types';
import { colors, spacing, type } from '../../src/theme';
import { formatShortDate } from '../../src/lib/greeting';

const PRIORITY_LABEL = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' } as const;
const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goals = useLifeStore((s) => s.goals);
  const allTasks = useLifeStore((s) => s.tasks);
  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);
  const tasks = useMemo(() => allTasks.filter((t) => t.goalId === id), [allTasks, id]);

  if (!goal) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Ziel nicht gefunden.</Text>
      </ScreenContainer>
    );
  }

  const areaColor = colors.area[goal.areaKey];

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.areaTag, { backgroundColor: `${areaColor}22` }]}>
          <Ionicons name={AREA_ICONS[goal.areaKey]} size={13} color={areaColor} />
          <Text style={[styles.areaLabel, { color: areaColor }]}>{AREA_LABELS[goal.areaKey]}</Text>
        </View>

        <Text style={styles.title}>{goal.title}</Text>

        <View style={styles.metaRow}>
          <Pill label={PRIORITY_LABEL[goal.priority]} tone={PRIORITY_TONE[goal.priority]} />
          {goal.deadline && <Pill label={`bis ${formatShortDate(goal.deadline)}`} />}
        </View>

        <GlassCard size="hero" style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <ProgressRing value={goal.progress} size={120} strokeWidth={12}>
            <Text style={styles.progressNumber}>{goal.progress}%</Text>
          </ProgressRing>
        </GlassCard>

        {tasks.length > 0 && (
          <View style={{ marginTop: spacing.xxl }}>
            <Text style={styles.sectionTitle}>Aufgaben</Text>
            <GlassCard>
              {tasks.map((t, i) => (
                <React.Fragment key={t.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.taskRow}>
                    <Ionicons
                      name={t.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={t.done ? colors.success : colors.textTertiary}
                    />
                    <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
                  </View>
                </React.Fragment>
              ))}
            </GlassCard>
          </View>
        )}

        <Button
          label="Mit KI besprechen"
          variant="secondary"
          style={{ marginTop: spacing.xxl }}
          icon={<Ionicons name="sparkles-outline" size={18} color={colors.textPrimary} />}
          onPress={() => router.replace('/(tabs)/ki')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  areaLabel: {
    ...type.caption,
  },
  title: {
    ...type.largeTitle,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  progressNumber: {
    ...type.numeric,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...type.title2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  taskText: {
    ...type.body,
    color: colors.textPrimary,
    flex: 1,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  notFound: {
    ...type.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
