import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Application, ApplicationStatus } from '../../data/types';
import { colors, radius, spacing, type } from '../../theme';
import { GlassCard, Button } from '../ui';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { formatDateForInput, parseDateInput } from '../../lib/dateInput';

const STATUSES: { key: ApplicationStatus; label: string }[] = [
  { key: 'entwurf', label: 'Entwurf' },
  { key: 'gesendet', label: 'Gesendet' },
  { key: 'gespraech', label: 'Gespräch' },
  { key: 'zusage', label: 'Zusage' },
  { key: 'absage', label: 'Absage' },
];

export type ApplicationFormValues = {
  company: string;
  role: string;
  status: ApplicationStatus;
  nextStep?: string;
  nextStepDate?: string;
};

export function ApplicationForm({
  initialApplication,
  onSubmit,
  onDelete,
  submitLabel = 'Bewerbung speichern',
}: {
  initialApplication?: Application;
  onSubmit: (values: ApplicationFormValues) => void;
  onDelete?: () => void;
  submitLabel?: string;
}) {
  const [company, setCompany] = useState(initialApplication?.company ?? '');
  const [role, setRole] = useState(initialApplication?.role ?? '');
  const [status, setStatus] = useState<ApplicationStatus>(initialApplication?.status ?? 'entwurf');
  const [nextStep, setNextStep] = useState(initialApplication?.nextStep ?? '');
  const [nextStepDateInput, setNextStepDateInput] = useState(formatDateForInput(initialApplication?.nextStepDate));
  const [dateError, setDateError] = useState(false);

  const canSubmit = company.trim().length > 0 && role.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    let nextStepDate: string | undefined;
    if (nextStepDateInput.trim().length > 0) {
      nextStepDate = parseDateInput(nextStepDateInput);
      if (!nextStepDate) {
        setDateError(true);
        return;
      }
    }
    onSubmit({
      company: company.trim(),
      role: role.trim(),
      status,
      nextStep: nextStep.trim() || undefined,
      nextStepDate,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Unternehmen</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={company}
          onChangeText={setCompany}
          placeholder="z. B. Stadtwerke Musterstadt"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          autoFocus={!initialApplication}
        />
      </GlassCard>

      <Text style={styles.label}>Position</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={role}
          onChangeText={setRole}
          placeholder="z. B. Ausbildung Elektroniker"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
        />
      </GlassCard>

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipRow}>
        {STATUSES.map(({ key, label }) => {
          const active = key === status;
          return (
            <AnimatedPressable key={key} onPress={() => setStatus(key)}>
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>

      <Text style={styles.label}>Nächster Schritt (optional)</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={nextStep}
          onChangeText={setNextStep}
          placeholder="z. B. Vorstellungsgespräch"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
        />
      </GlassCard>

      <Text style={styles.label}>Termin dafür (optional)</Text>
      <GlassCard style={styles.inputCard}>
        <TextInput
          value={nextStepDateInput}
          onChangeText={(v) => {
            setNextStepDateInput(v);
            setDateError(false);
          }}
          placeholder="TT.MM.JJJJ"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          keyboardType="numbers-and-punctuation"
        />
      </GlassCard>
      {dateError && <Text style={styles.errorText}>Bitte im Format TT.MM.JJJJ eingeben.</Text>}

      <Button label={submitLabel} onPress={handleSubmit} disabled={!canSubmit} style={{ marginTop: spacing.xl }} />

      {onDelete && (
        <Button label="Bewerbung löschen" variant="ghost" onPress={onDelete} style={{ marginTop: spacing.md }} />
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
