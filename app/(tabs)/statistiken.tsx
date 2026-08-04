import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../src/components/ui';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { MiniBarChart } from '../../src/components/domain/MiniBarChart';
import { AREA_ICONS, AREA_LABELS, AreaKey } from '../../src/data/types';
import { colors, spacing, type } from '../../src/theme';

const AREA_ORDER: AreaKey[] = ['ausbildung', 'psyche', 'geld', 'fuehrerschein'];
const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Illustrative 7-day trend leading up to today's real score. Once
// `life_scores` snapshots exist in Supabase, this becomes a real query.
function buildTrend(current: number) {
  const seed = [-9, -5, -7, -3, -2, -1, 0];
  return seed.map((delta, i) => ({
    label: WEEKDAY_LABELS[i],
    value: Math.max(0.05, Math.min(1, (current + delta) / 100)),
  }));
}

export default function StatistikenScreen() {
  const lifeScore = useLifeStore((s) => s.lifeScore);
  const score = lifeScore();
  const trend = useMemo(() => buildTrend(score.overall), [score.overall]);
  const weekDelta = Math.round((trend[6].value - trend[0].value) * 100);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Statistiken</Text>

        <View style={styles.section}>
          <GlassCard size="hero">
            <View style={styles.heroTop}>
              <ProgressRing value={score.overall} size={96} strokeWidth={10}>
                <Text style={styles.scoreNumber}>{score.overall}</Text>
              </ProgressRing>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>Life Score</Text>
                <View style={styles.deltaRow}>
                  <Ionicons
                    name={weekDelta >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={weekDelta >= 0 ? colors.success : colors.danger}
                  />
                  <Text style={[styles.deltaText, { color: weekDelta >= 0 ? colors.success : colors.danger }]}>
                    {weekDelta >= 0 ? '+' : ''}
                    {weekDelta} diese Woche
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <MiniBarChart bars={trend} color={colors.accent} />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Bereiche" />
          <View style={styles.grid}>
            {AREA_ORDER.map((area) => (
              <GlassCard key={area} style={styles.areaCard}>
                <ProgressRing
                  value={score[area]}
                  size={64}
                  strokeWidth={7}
                  colorFrom={colors.area[area]}
                  colorTo={colors.area[area]}
                >
                  <Ionicons name={AREA_ICONS[area]} size={20} color={colors.area[area]} />
                </ProgressRing>
                <Text style={styles.areaLabel}>{AREA_LABELS[area]}</Text>
                <Text style={styles.areaValue}>{score[area]}%</Text>
              </GlassCard>
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
  title: {
    ...type.largeTitle,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  scoreNumber: {
    ...type.numeric,
    fontSize: 28,
    color: colors.textPrimary,
  },
  heroLabel: {
    ...type.headline,
    color: colors.textPrimary,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  deltaText: {
    ...type.footnote,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  areaCard: {
    width: '47%',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  areaLabel: {
    ...type.headline,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  areaValue: {
    ...type.footnote,
    color: colors.textTertiary,
  },
});
