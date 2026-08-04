import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../../src/components/ui';
import { ProgressRing } from '../../../src/components/ui/ProgressRing';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { DomainHeader } from '../../../src/components/domain/DomainHeader';
import { TaskRow } from '../../../src/components/domain/TaskRow';
import { colors, spacing, type } from '../../../src/theme';
import { formatShortDate } from '../../../src/lib/greeting';

const currency = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export default function FuehrerscheinScreen() {
  const { drivingLicense, tasks, toggleTask, lifeScore } = useLifeStore();
  const score = lifeScore();
  const areaTasks = tasks.filter((t) => t.areaKey === 'fuehrerschein');

  const daysLeft = useMemo(() => {
    if (!drivingLicense.examDate) return null;
    const diff = new Date(drivingLicense.examDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [drivingLicense.examDate]);

  const restBudget = drivingLicense.budgetTotal - drivingLicense.costsSpent;
  const lessonsPct = Math.round((drivingLicense.lessonsCompleted / drivingLicense.lessonsPlanned) * 100);

  return (
    <ScreenContainer>
      <DomainHeader title="Führerschein" area="fuehrerschein" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <GlassCard size="hero">
            <View style={styles.heroTop}>
              <ProgressRing
                value={drivingLicense.theoryProgressPct}
                size={104}
                strokeWidth={11}
                colorFrom={colors.area.fuehrerschein}
                colorTo={colors.area.fuehrerschein}
              >
                <Text style={styles.ringValue}>{drivingLicense.theoryProgressPct}%</Text>
                <Text style={styles.ringCaption}>Theorie</Text>
              </ProgressRing>
              <View style={{ flex: 1 }}>
                {daysLeft !== null && (
                  <>
                    <Text style={styles.countdownValue}>{daysLeft} Tage</Text>
                    <Text style={styles.countdownLabel}>bis zur Theorieprüfung</Text>
                  </>
                )}
                <View style={styles.examDateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
                  <Text style={styles.examDateText}>
                    {drivingLicense.examDate ? formatShortDate(drivingLicense.examDate) : 'Kein Termin'}
                  </Text>
                </View>
                <Text style={styles.mockExamText}>
                  Ø {drivingLicense.theoryMockExamAvgPct}% in Übungsprüfungen
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>
              {drivingLicense.lessonsCompleted}/{drivingLicense.lessonsPlanned}
            </Text>
            <Text style={styles.statLabel}>Fahrstunden</Text>
            <ProgressBar value={lessonsPct} color={colors.area.fuehrerschein} />
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{currency(restBudget)}</Text>
            <Text style={styles.statLabel}>Restbudget</Text>
            <ProgressBar
              value={Math.round((drivingLicense.costsSpent / drivingLicense.budgetTotal) * 100)}
              color={colors.warning}
            />
          </GlassCard>
        </View>

        {areaTasks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Lernplan" />
            <GlassCard>
              {areaTasks.map((task, i) => (
                <React.Fragment key={task.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <TaskRow task={task} onToggle={toggleTask} />
                </React.Fragment>
              ))}
            </GlassCard>
          </View>
        )}

        <View style={[styles.section, { marginBottom: 0 }]}>
          <SectionHeader title="Kosten" />
          <GlassCard>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Ausgegeben</Text>
              <Text style={styles.costValue}>{currency(drivingLicense.costsSpent)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Gesamtbudget</Text>
              <Text style={styles.costValue}>{currency(drivingLicense.budgetTotal)}</Text>
            </View>
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  ringValue: {
    ...type.title2,
    color: colors.textPrimary,
  },
  ringCaption: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
  },
  countdownValue: {
    ...type.title1,
    color: colors.textPrimary,
  },
  countdownLabel: {
    ...type.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  examDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  examDateText: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  mockExamText: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    gap: spacing.sm,
  },
  statValue: {
    ...type.title2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...type.footnote,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  costLabel: {
    ...type.callout,
    color: colors.textSecondary,
  },
  costValue: {
    ...type.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
