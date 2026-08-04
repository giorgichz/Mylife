import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../../src/components/ui';
import { DomainHeader } from '../../../src/components/domain/DomainHeader';
import { MoodMetricRow } from '../../../src/components/domain/MoodMetricRow';
import { MiniBarChart } from '../../../src/components/domain/MiniBarChart';
import { derivePsycheInsight } from '../../../src/lib/insights';
import { colors, spacing, type } from '../../../src/theme';

export default function PsycheScreen() {
  const { moodLogs, updateTodayMood, todayMoodLog, lifeScore } = useLifeStore();
  const score = lifeScore();
  const today = todayMoodLog();
  const insight = useMemo(() => derivePsycheInsight(moodLogs), [moodLogs]);

  const last7 = moodLogs.slice(-7);
  const moodBars = last7.map((l) => ({
    label: new Date(l.date).toLocaleDateString('de-DE', { weekday: 'narrow' }),
    value: l.mood / 5,
  }));
  const sleepBars = last7.map((l) => ({
    label: new Date(l.date).toLocaleDateString('de-DE', { weekday: 'narrow' }),
    value: Math.min(1, l.sleep / 9),
  }));

  return (
    <ScreenContainer>
      <DomainHeader title="Psyche" area="psyche" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <GlassCard size="hero" style={styles.insightCard}>
            <View style={styles.insightIconWrap}>
              <Ionicons name={insight.icon} size={18} color={colors.area.psyche} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightText}>{insight.text}</Text>
              <Text style={styles.insightTip}>{insight.tip}</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Heute eintragen" />
          <GlassCard style={styles.card}>
            <MoodMetricRow label="Stimmung" value={today.mood} onChange={(v) => updateTodayMood('mood', v)} color={colors.area.psyche} />
            <View style={styles.divider} />
            <MoodMetricRow label="Energie" value={today.energy} onChange={(v) => updateTodayMood('energy', v)} color={colors.area.psyche} />
            <View style={styles.divider} />
            <MoodMetricRow label="Motivation" value={today.motivation} onChange={(v) => updateTodayMood('motivation', v)} color={colors.area.psyche} />
            <View style={styles.divider} />
            <MoodMetricRow label="Stress" value={today.stress} onChange={(v) => updateTodayMood('stress', v)} color={colors.warning} />
          </GlassCard>
        </View>

        {last7.length > 0 && (
          <>
            <View style={styles.section}>
              <SectionHeader title="Stimmung · 7 Tage" />
              <GlassCard style={styles.card}>
                <MiniBarChart bars={moodBars} color={colors.area.psyche} />
              </GlassCard>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Schlaf · 7 Tage" />
              <GlassCard style={styles.card}>
                <MiniBarChart bars={sleepBars} color={colors.accent} />
              </GlassCard>
            </View>
          </>
        )}

        <View style={styles.section}>
          <SectionHeader title="Psyche-Score" />
          <GlassCard style={styles.card}>
            <Text style={styles.scoreValue}>{score.psyche}%</Text>
            <Text style={styles.scoreHint}>Basierend auf den letzten 7 Tagen (Stimmung, Energie, Motivation, Stress, Schlaf).</Text>
          </GlassCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
  },
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  card: {},
  insightCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${colors.area.psyche}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    ...type.headline,
    color: colors.textPrimary,
  },
  insightTip: {
    ...type.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  scoreValue: {
    ...type.title1,
    color: colors.textPrimary,
  },
  scoreHint: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
