import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../../src/components/ui';
import { ProgressRing } from '../../../src/components/ui/ProgressRing';
import { AnimatedPressable } from '../../../src/components/ui/AnimatedPressable';
import { GoalCard } from '../../../src/components/domain/GoalCard';
import { AREA_ICONS, AREA_LABELS, AreaKey } from '../../../src/data/types';
import { colors, spacing, type } from '../../../src/theme';

const AREAS: { key: AreaKey; route: string }[] = [
  { key: 'ausbildung', route: '/(tabs)/ziele/ausbildung' },
  { key: 'psyche', route: '/(tabs)/ziele/psyche' },
  { key: 'geld', route: '/(tabs)/ziele/geld' },
  { key: 'fuehrerschein', route: '/(tabs)/ziele/fuehrerschein' },
];

export default function ZieleScreen() {
  const { goals, lifeScore } = useLifeStore();
  const score = lifeScore();
  const activeGoals = goals.filter((g) => g.status === 'active' && !g.parentGoalId);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ziele</Text>
          <AnimatedPressable style={styles.addButton} onPress={() => router.push('/goal/new')} hitSlop={8}>
            <Ionicons name="add" size={22} color={colors.textInverse} />
          </AnimatedPressable>
        </View>

        <View style={styles.grid}>
          {AREAS.map(({ key, route }) => (
            <AnimatedPressable key={key} onPress={() => router.push(route as any)} style={styles.gridItem}>
              <GlassCard style={styles.areaCard}>
                <ProgressRing
                  value={score[key]}
                  size={54}
                  strokeWidth={6}
                  colorFrom={colors.area[key]}
                  colorTo={colors.area[key]}
                >
                  <Ionicons name={AREA_ICONS[key]} size={18} color={colors.area[key]} />
                </ProgressRing>
                <Text style={styles.areaTitle}>{AREA_LABELS[key]}</Text>
                <Text style={styles.areaScore}>{score[key]}%</Text>
              </GlassCard>
            </AnimatedPressable>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Aktive Ziele" />
          <View style={styles.list}>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} width="100%" />
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    ...type.largeTitle,
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
  },
  gridItem: {
    width: '47%',
  },
  areaCard: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  areaTitle: {
    ...type.headline,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  areaScore: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  list: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
});
