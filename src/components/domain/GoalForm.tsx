import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AREA_ICONS, AREA_LABELS, AreaKey, Goal, Priority } from '../../data/types';
import { colors, radius, spacing, type } from '../../theme';
import { GlassCard, Button } from '../ui';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { formatDateForInput, parseDateInput } from '../../lib/dateInput';

const AREAS: AreaKey[] = ['ausbildung', 'psyche', 'geld', 'fuehrerschein'];
const PRIORITIES: { key: Priority; label: string }[] = [
  { key: 'low', label: 'Niedrig' },
  { key: 'medium', label: 'Mittel' },
  { key: 'high', label: 'Hoch' },
];

export type GoalFormValues = {
  title: string;
  areaKey: AreaKey;
  priority: Priority;
  deadline?: string;
  parentGoalId?: string;
};

export function GoalForm({
  initialGoal,
  presetArea,
  existingGoals = [],
  onSubmit,
  onDelete,
  submitLabel = 'Ziel speichern',
}: {
  initialGoal?: Goal;
  presetArea?: AreaKey;
  /** Used to build the "übergeordnetes Ziel" picker — pass the full goals list. */
  existingGoals?: Goal[];
  onSubmit: (values: GoalFormValues) => void;
  onDelete?: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initialGoal?.title ?? '');
  const [areaKey, setAreaKey] = useState<AreaKey>(initialGoal?.areaKey ?? presetArea ?? 'ausbildung');
  const [priority, setPriority] = useState<Priority>(initialGoal?.priority ?? 'medium');
  const [deadlineInput, setDeadlineInput] = useState(formatDateForInput(initialGoal?.deadline));
  const [deadlineError, setDeadlineError] = useState(false);
  const [parentGoalId, setParentGoalId] = useState<string | undefined>(initialGoal?.parentGoalId);

  const canSubmit = title.trim().length > 0;

  // Only one level of nesting, same area, excluding self.
  const parentCandidates = existingGoals.filter(
    (g) => g.areaKey === areaKey && g.id !== initialGoal?.id && !g.parentGoalId
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    let deadline: string | undefined;
    if (deadlineInput.trim().length > 0) {
      deadline = parseDateInput(deadlineInput);
      if (!deadline) {
        setDeadlineError(true);
        return;
      }
    }
    onSubmit({ title: title.trim(), areaKey, priority, deadline, parentGoalId });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Titel</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="z. B. Führerschein bis September schaffen"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
          autoFocus={!initialGoal}
        />
      </GlassCard>

      <Text style={styles.label}>Bereich</Text>
      <View style={styles.chipRow}>
        {AREAS.map((area) => {
          const active = area === areaKey;
          const color = colors.area[area];
          return (
            <AnimatedPressable
              key={area}
              onPress={() => {
                setAreaKey(area);
                setParentGoalId(undefined);
              }}
            >
              <View
                style={[
                  styles.chip,
                  { borderColor: active ? color : colors.glassBorderStrong },
                  active && { backgroundColor: `${color}22` },
                ]}
              >
                <Ionicons name={AREA_ICONS[area]} size={14} color={active ? color : colors.textSecondary} />
                <Text style={[styles.chipLabel, active && { color }]}>{AREA_LABELS[area]}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>

      <Text style={styles.label}>Priorität</Text>
      <View style={styles.chipRow}>
        {PRIORITIES.map(({ key, label }) => {
          const active = key === priority;
          return (
            <AnimatedPressable key={key} onPress={() => setPriority(key)}>
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>

      {parentCandidates.length > 0 && (
        <>
          <Text style={styles.label}>Übergeordnetes Ziel (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <AnimatedPressable onPress={() => setParentGoalId(undefined)}>
              <View style={[styles.chip, !parentGoalId && styles.chipActive]}>
                <Text style={[styles.chipLabel, !parentGoalId && styles.chipLabelActive]}>Kein</Text>
              </View>
            </AnimatedPressable>
            {parentCandidates.map((g) => {
              const active = g.id === parentGoalId;
              return (
                <AnimatedPressable key={g.id} onPress={() => setParentGoalId(g.id)}>
                  <View style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={1}>
                      {g.title.length > 28 ? `${g.title.slice(0, 28)}…` : g.title}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </>
      )}

      <Text style={styles.label}>Deadline (optional)</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={deadlineInput}
          onChangeText={(v) => {
            setDeadlineInput(v);
            setDeadlineError(false);
          }}
          placeholder="TT.MM.JJJJ"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          keyboardType="numbers-and-punctuation"
        />
      </GlassCard>
      {deadlineError && <Text style={styles.errorText}>Bitte im Format TT.MM.JJJJ eingeben.</Text>}

      <Button label={submitLabel} onPress={handleSubmit} disabled={!canSubmit} style={{ marginTop: spacing.xl }} />

      {onDelete && (
        <Button
          label="Ziel löschen"
          variant="ghost"
          onPress={onDelete}
          style={{ marginTop: spacing.md }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxl,
  },
  label: {
    ...type.footnote,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  inputCard: {
    padding: 0,
  },
  input: {
    ...type.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  errorText: {
    ...type.footnote,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
