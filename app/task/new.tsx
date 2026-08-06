import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, Button } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AREA_ICONS, AREA_LABELS, AreaKey } from '../../src/data/types';
import { colors, radius, spacing, type } from '../../src/theme';

const AREAS: AreaKey[] = ['ausbildung', 'psyche', 'geld', 'fuehrerschein'];

export default function NewTaskScreen() {
  const { area: presetArea } = useLocalSearchParams<{ area?: AreaKey }>();
  const addTasks = useLifeStore((s) => s.addTasks);
  const goals = useLifeStore((s) => s.goals);

  const [title, setTitle] = useState('');
  const [areaKey, setAreaKey] = useState<AreaKey>(presetArea ?? 'ausbildung');
  const [goalId, setGoalId] = useState<string | undefined>(undefined);

  const canSubmit = title.trim().length > 0;
  const relatedGoals = goals.filter((g) => g.areaKey === areaKey && g.status === 'active');

  const handleSubmit = () => {
    if (!canSubmit) return;
    addTasks([{ title: title.trim(), areaKey, goalId, done: false, dueDate: new Date().toISOString() }]);
    router.back();
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Neue Aufgabe</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Titel</Text>
        <GlassCard style={styles.inputCard}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="z. B. 20 Testfragen üben"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            autoFocus
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
                  setGoalId(undefined);
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

        {relatedGoals.length > 0 && (
          <>
            <Text style={styles.label}>Zu welchem Ziel gehört sie? (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <AnimatedPressable onPress={() => setGoalId(undefined)}>
                <View style={[styles.chip, !goalId && styles.chipActive]}>
                  <Text style={[styles.chipLabel, !goalId && styles.chipLabelActive]}>Kein Ziel</Text>
                </View>
              </AnimatedPressable>
              {relatedGoals.map((g) => {
                const active = g.id === goalId;
                return (
                  <AnimatedPressable key={g.id} onPress={() => setGoalId(g.id)}>
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

        <Button label="Aufgabe anlegen" onPress={handleSubmit} disabled={!canSubmit} style={{ marginTop: spacing.xl }} />
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
    marginBottom: spacing.md,
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
});
