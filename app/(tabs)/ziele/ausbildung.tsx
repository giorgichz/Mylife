import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader, Pill } from '../../../src/components/ui';
import { AnimatedPressable } from '../../../src/components/ui/AnimatedPressable';
import { DomainHeader } from '../../../src/components/domain/DomainHeader';
import { GoalCard } from '../../../src/components/domain/GoalCard';
import { TaskRow } from '../../../src/components/domain/TaskRow';
import { ApplicationStatus } from '../../../src/data/types';
import { colors, spacing, type } from '../../../src/theme';
import { formatShortDate } from '../../../src/lib/greeting';

const STATUS_META: Record<ApplicationStatus, { label: string; tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }> = {
  entwurf: { label: 'Entwurf', tone: 'neutral' },
  gesendet: { label: 'Gesendet', tone: 'accent' },
  gespraech: { label: 'Gespräch', tone: 'warning' },
  zusage: { label: 'Zusage', tone: 'success' },
  absage: { label: 'Absage', tone: 'danger' },
};

export default function AusbildungScreen() {
  const { goals, tasks, applications, toggleTask, lifeScore } = useLifeStore();
  const score = lifeScore();
  const areaGoals = goals.filter((g) => g.areaKey === 'ausbildung' && g.status === 'active');
  const areaTasks = tasks.filter((t) => t.areaKey === 'ausbildung');

  return (
    <ScreenContainer>
      <DomainHeader title="Ausbildung" area="ausbildung" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{score.ausbildung}%</Text>
            <Text style={styles.statLabel}>Fortschritt</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{applications.length}</Text>
            <Text style={styles.statLabel}>Bewerbungen</Text>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Bewerbungen" actionLabel="+ Neu" onAction={() => router.push('/application/new')} />
          {applications.length === 0 ? (
            <GlassCard style={styles.taskCard}>
              <Text style={styles.emptyText}>Noch keine Bewerbungen eingetragen.</Text>
            </GlassCard>
          ) : (
            <View style={styles.appList}>
              {applications.map((app) => {
                const meta = STATUS_META[app.status];
                return (
                  <AnimatedPressable
                    key={app.id}
                    onPress={() => router.push({ pathname: '/application/edit', params: { id: app.id } })}
                  >
                    <GlassCard style={styles.appCard}>
                      <View style={styles.appRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.appCompany}>{app.company}</Text>
                          <Text style={styles.appRole}>{app.role}</Text>
                        </View>
                        <Pill label={meta.label} tone={meta.tone} />
                      </View>
                      {app.nextStep && app.nextStepDate && (
                        <View style={styles.nextStepRow}>
                          <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
                          <Text style={styles.nextStepText}>
                            {app.nextStep} · {formatShortDate(app.nextStepDate)}
                          </Text>
                        </View>
                      )}
                    </GlassCard>
                  </AnimatedPressable>
                );
              })}
            </View>
          )}
        </View>

        {areaGoals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Ziele" />
            <View style={styles.list}>
              {areaGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} width="100%" />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Aufgaben" />
          <GlassCard style={styles.taskCard}>
            {areaTasks.map((task, i) => (
              <React.Fragment key={task.id}>
                {i > 0 && <View style={styles.divider} />}
                <TaskRow task={task} onToggle={toggleTask} />
              </React.Fragment>
            ))}
            {areaTasks.length > 0 && <View style={styles.divider} />}
            <AnimatedPressable
              onPress={() => router.push({ pathname: '/task/new', params: { area: 'ausbildung' } })}
              style={styles.addRow}
              scaleTo={0.99}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              <Text style={styles.addRowText}>Aufgabe hinzufügen</Text>
            </AnimatedPressable>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...type.title1,
    color: colors.textPrimary,
  },
  statLabel: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  appList: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  appCard: {},
  emptyText: {
    ...type.callout,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  appCompany: {
    ...type.headline,
    color: colors.textPrimary,
  },
  appRole: {
    ...type.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  nextStepText: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  list: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  taskCard: {
    marginHorizontal: spacing.screenX,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  addRowText: {
    ...type.callout,
    color: colors.accent,
  },
});
