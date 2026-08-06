import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ApplicationForm } from '../../src/components/domain/ApplicationForm';
import { colors, spacing, type } from '../../src/theme';

export default function EditApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applications = useLifeStore((s) => s.applications);
  const updateApplication = useLifeStore((s) => s.updateApplication);
  const deleteApplication = useLifeStore((s) => s.deleteApplication);
  const application = useMemo(() => applications.find((a) => a.id === id), [applications, id]);

  if (!application) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Bewerbung nicht gefunden.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bewerbung bearbeiten</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </AnimatedPressable>
      </View>
      <ApplicationForm
        initialApplication={application}
        submitLabel="Änderungen speichern"
        onSubmit={(values) => {
          updateApplication(application.id, values);
          router.back();
        }}
        onDelete={() => {
          deleteApplication(application.id);
          router.back();
        }}
      />
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
  notFound: {
    ...type.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
