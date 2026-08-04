import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader, Pill } from '../../src/components/ui';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AreaScoreRow } from '../../src/components/domain/AreaScoreRow';
import { GoalCard } from '../../src/components/domain/GoalCard';
import { TaskRow } from '../../src/components/domain/TaskRow';
import { colors, spacing, type } from '../../src/theme';
import { timeBasedGreeting, formatShortDate, formatTime } from '../../src/lib/greeting';
import { AREA_ICONS, AreaKey } from '../../src/data/types';

const AREA_ORDER: AreaKey[] = ['ausbildung', 'psyche', 'geld', 'fuehrerschein'];

export default function HomeScreen() {
  const { user, goals, tasks, appointments, toggleTask, lifeScore } = useLifeStore();
  const score = lifeScore();

  const todayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((t) => !t.dueDate || new Date(t.dueDate).toDateString() === today);
  }, [tasks]);

  const topGoals = useMemo(() => {
    const priorityWeight = { high: 0, medium: 1, low: 2 } as const;
    return [...goals]
      .filter((g) => g.status === 'active')
      .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
      .slice(0, 4);
  }, [goals]);

  const nextAppointments = appointments.slice(0, 2);
  const doneCount = todayTasks.filter((t) => t.done).length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{timeBasedGreeting(user.firstName)}</Text>
            <Text style={styles.date}>{formatShortDate(new Date().toISOString())}</Text>
          </View>
          <AnimatedPressable style={styles.avatarButton} onPress={() => router.push('/(tabs)/profil')}>
            <Text style={styles.avatarInitial}>{user.firstName.charAt(0)}</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.section}>
          <GlassCard size="hero">
            <View style={styles.heroTop}>
              <ProgressRing value={score.overall} size={104} strokeWidth={11}>
                <Text style={styles.scoreNumber}>{score.overall}</Text>
                <Text style={styles.scoreCaption}>Life Score</Text>
              </ProgressRing>
              <View style={styles.heroBreakdown}>
                {AREA_ORDER.map((area) => (
                  <AreaScoreRow key={area} area={area} score={score[area]} />
                ))}
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <AnimatedPressable
            onPress={() => (topGoals.length > 0 ? router.push(`/goal/${topGoals[0].id}`) : router.push('/goal/new'))}
          >
            <GlassCard style={styles.focusCard}>
              <View style={styles.focusIconWrap}>
                <Ionicons name="flash" size={16} color={colors.area.psyche} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.focusLabel}>Tagesfokus</Text>
                <Text style={styles.focusText}>
                  {topGoals.length > 0 ? topGoals[0].title : 'Leg dein erstes Ziel an, um loszulegen.'}
                </Text>
              </View>
              <View style={styles.focusArrow}>
                <Ionicons name="arrow-forward" size={16} color={colors.area.psyche} />
              </View>
            </GlassCard>
          </AnimatedPressable>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Heute erledigen" actionLabel={`${doneCount}/${todayTasks.length}`} />
          <GlassCard style={styles.listCard} flat>
            {todayTasks.length === 0 ? (
              <Text style={styles.emptyText}>Für heute ist nichts offen. Genieß den Tag 🎉</Text>
            ) : (
              todayTasks.map((task, i) => (
                <React.Fragment key={task.id}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <TaskRow task={task} onToggle={toggleTask} />
                </React.Fragment>
              ))
            )}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Wichtigste Ziele" actionLabel="Alle" onAction={() => router.push('/(tabs)/ziele')} />
          <View style={styles.goalsGrid}>
            {topGoals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} variant="grid" />
            ))}
          </View>
        </View>

        {nextAppointments.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Termine" />
            <GlassCard style={styles.listCard}>
              {nextAppointments.map((appt, i) => (
                <React.Fragment key={appt.id}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <View style={styles.apptRow}>
                    <View style={styles.apptIconWrap}>
                      <Ionicons
                        name={appt.areaKey ? AREA_ICONS[appt.areaKey] : 'calendar-outline'}
                        size={16}
                        color={appt.areaKey ? colors.area[appt.areaKey] : colors.accent}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.apptTitle}>{appt.title}</Text>
                      <Text style={styles.apptTime}>
                        {formatShortDate(appt.date)} · {formatTime(appt.date)}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </GlassCard>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Schnellaktionen" />
          <View style={styles.quickRow}>
            <QuickAction icon="sparkles-outline" label="KI fragen" onPress={() => router.push('/(tabs)/ki')} />
            <QuickAction icon="add-circle-outline" label="Ziel erstellen" onPress={() => router.push('/goal/new')} />
            <QuickAction icon="happy-outline" label="Stimmung" onPress={() => router.push('/(tabs)/ziele/psyche')} />
            <QuickAction icon="cash-outline" label="Ausgaben" onPress={() => router.push('/(tabs)/ziele/geld')} />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.quickAction}>
      <GlassCard style={styles.quickCard}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text style={styles.quickLabel}>{label}</Text>
      </GlassCard>
    </AnimatedPressable>
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
  greeting: {
    ...type.title1,
    color: colors.textPrimary,
  },
  date: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...type.headline,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  scoreNumber: {
    ...type.numeric,
    fontSize: 30,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  scoreCaption: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
    marginTop: 2,
  },
  heroBreakdown: {
    flex: 1,
  },
  focusCard: {
    marginHorizontal: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  focusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: `${colors.area.psyche}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusLabel: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
    marginBottom: 2,
  },
  focusText: {
    ...type.headline,
    color: colors.textPrimary,
  },
  focusArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: `${colors.area.psyche}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    marginHorizontal: spacing.screenX,
  },
  emptyText: {
    ...type.callout,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  apptIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptTitle: {
    ...type.callout,
    color: colors.textPrimary,
  },
  apptTime: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  quickAction: {
    width: '47%',
  },
  quickCard: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  quickLabel: {
    ...type.callout,
    color: colors.textPrimary,
  },
});
