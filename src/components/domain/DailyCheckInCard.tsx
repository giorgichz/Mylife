import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { useLifeStore } from '../../store/useLifeStore';
import { GlassCard } from '../ui';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { MoodFaceSelector } from './MoodFaceSelector';
import { colors, radius, spacing, type } from '../../theme';

const WORK_UNTIL_OPTIONS = ['Bis 14 Uhr', 'Bis 17 Uhr', 'Bis 20 Uhr', 'Frei heute'];

/**
 * Once-a-day, low-friction check-in shown on Home until answered (or
 * skipped) — feeds the AI's plan generation with "how much time/energy is
 * realistically there today" instead of it guessing. Separate from the
 * fuller Psyche mood picker; this is deliberately just 2 taps.
 */
export function DailyCheckInCard({ style }: { style?: ViewStyle }) {
  const { todayMoodLog, updateTodayMood, submitDailyCheckIn } = useLifeStore();
  const [workUntil, setWorkUntil] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');
  const mood = todayMoodLog().mood;

  const submit = () => {
    submitDailyCheckIn({ workUntil, note: note.trim() || undefined });
  };

  return (
    <GlassCard size="hero" style={style}>
      <Text style={styles.title}>Kurzer Start in den Tag</Text>
      <Text style={styles.subtitle}>Hilft der KI, deinen Tag realistisch zu planen — dauert 10 Sekunden.</Text>

      <Text style={styles.label}>Wie geht's dir?</Text>
      <MoodFaceSelector value={mood} onChange={(v) => updateTodayMood('mood', v)} />

      <Text style={[styles.label, { marginTop: spacing.lg }]}>Bis wann hast du heute Zeit für dich?</Text>
      <View style={styles.chipRow}>
        {WORK_UNTIL_OPTIONS.map((option) => {
          const active = workUntil === option;
          return (
            <AnimatedPressable key={option} onPress={() => setWorkUntil(active ? undefined : option)}>
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Sonst noch was heute? (optional)"
        placeholderTextColor={colors.textTertiary}
        style={styles.noteInput}
      />

      <View style={styles.actions}>
        <AnimatedPressable onPress={submit} style={styles.primaryButton} scaleTo={0.97}>
          <Text style={styles.primaryButtonText}>Los geht's</Text>
        </AnimatedPressable>
        <AnimatedPressable onPress={submit} hitSlop={8}>
          <Text style={styles.skipText}>Überspringen</Text>
        </AnimatedPressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  label: {
    ...type.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    backgroundColor: colors.glassFillStrong,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...type.footnote,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.accent,
  },
  noteInput: {
    ...type.footnote,
    color: colors.textPrimary,
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
  primaryButtonText: {
    ...type.callout,
    color: colors.textInverse,
    fontWeight: '600',
  },
  skipText: {
    ...type.footnote,
    color: colors.textTertiary,
  },
});
