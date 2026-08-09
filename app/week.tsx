import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../src/store/useLifeStore';
import { ScreenContainer, GlassCard } from '../src/components/ui';
import { AnimatedPressable } from '../src/components/ui/AnimatedPressable';
import { TaskRow } from '../src/components/domain/TaskRow';
import { AREA_ICONS, AREA_LABELS } from '../src/data/types';
import { colors, spacing, type } from '../src/theme';
import { formatTime } from '../src/lib/greeting';

const WEEKDAY_LABELS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function nextDays(count: number): Date[] {
  const start = startOfDay(new Date());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function dayHeaderLabel(d: Date, isToday: boolean, isTomorrow: boolean): string {
  if (isToday) return 'Heute';
  if (isTomorrow) return 'Morgen';
  return `${WEEKDAY_LABELS[d.getDay()]} ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
}

export default function WeekScreen() {
  const { tasks, appointments, goals, toggleTask } = useLifeStore();
  const days = useMemo(() => nextDays(7), []);

  const dayData = useMemo(() => {
    return days.map((day, index) => {
      const dayKey = day.toDateString();
      const isToday = index === 0;
      const isTomorrow = index === 1;

      const dayTasks = tasks.filter((t) => {
        if (t.dueDate) return new Date(t.dueDate).toDateString() === dayKey;
        return isToday;
      });
      const dayAppointments = appointments.filter((a) => new Date(a.date).toDateString() === dayKey);
      const dayDeadlines = goals.filter((g) => g.status === 'active' && g.deadline && new Date(g.deadline).toDateString() === dayKey);

      return {
        date: day,
        label: dayHeaderLabel(day, isToday, isTomorrow),
        isToday,
        tasks: dayTasks,
        appointments: dayAppointments,
        deadlines: dayDeadlines,
      };
    });
  }, [days, tasks, appointments, goals]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Diese Woche</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {dayData.map((day) => {
          const isEmpty = day.tasks.length === 0 && day.appointments.length === 0 && day.deadlines.length === 0;
          return (
            <View key={day.date.toISOString()} style={styles.daySection}>
              <View style={styles.dayHeaderRow}>
                <Text style={[styles.dayHeaderText, day.isToday && styles.dayHeaderTextToday]}>{day.label}</Text>
                {!isEmpty && (
                  <Text style={styles.dayCount}>
                    {day.tasks.length > 0 ? `${day.tasks.filter((t) => t.done).length}/${day.tasks.length}` : ''}
                  </Text>
                )}
              </View>
              <GlassCard style={styles.dayCard} flat>
                {isEmpty ? (
                  <Text style={styles.emptyText}>Nichts geplant</Text>
                ) : (
                  <>
                    {day.deadlines.map((g, i) => (
                      <View key={g.id} style={[styles.deadlineRow, i > 0 && styles.rowDivider]}>
                        <View style={[styles.deadlineIconWrap, { backgroundColor: `${colors.warning}22` }]}>
                          <Ionicons name="flag" size={13} color={colors.warning} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.deadlineText} numberOfLines={1}>
                            {g.title}
                          </Text>
                          <Text style={styles.deadlineMeta}>Deadline · {AREA_LABELS[g.areaKey]}</Text>
                        </View>
                      </View>
                    ))}
                    {day.appointments.map((appt, i) => (
                      <View key={appt.id} style={[styles.apptRow, (i > 0 || day.deadlines.length > 0) && styles.rowDivider]}>
                        <View style={styles.apptIconWrap}>
                          <Ionicons
                            name={appt.areaKey ? AREA_ICONS[appt.areaKey] : 'calendar-outline'}
                            size={14}
                            color={appt.areaKey ? colors.area[appt.areaKey] : colors.accent}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.apptTitle} numberOfLines={1}>
                            {appt.title}
                          </Text>
                          <Text style={styles.deadlineMeta}>{formatTime(appt.date)}</Text>
                        </View>
                      </View>
                    ))}
                    {day.tasks.map((task, i) => (
                      <View key={task.id} style={(i > 0 || day.deadlines.length > 0 || day.appointments.length > 0) && styles.rowDivider}>
                        <TaskRow task={task} onToggle={toggleTask} />
                      </View>
                    ))}
                  </>
                )}
              </GlassCard>
            </View>
          );
        })}
      </ScrollView>
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
    marginBottom: spacing.lg,
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
  content: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxl,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  dayHeaderText: {
    ...type.headline,
    color: colors.textSecondary,
  },
  dayHeaderTextToday: {
    color: colors.accent,
  },
  dayCount: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  dayCard: {
    padding: spacing.md,
  },
  emptyText: {
    ...type.footnote,
    color: colors.textTertiary,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  deadlineIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineText: {
    ...type.callout,
    color: colors.textPrimary,
  },
  deadlineMeta: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
    marginTop: 2,
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  apptIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.glassFillStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptTitle: {
    ...type.callout,
    color: colors.textPrimary,
  },
});
