import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { SettingsRow } from '../../src/components/domain/SettingsRow';
import { useAuth } from '../../src/lib/AuthProvider';
import { colors, spacing, type } from '../../src/theme';

export default function ProfilScreen() {
  const { user, lifeScore, updateUserName } = useLifeStore();
  const { session, ready, error } = useAuth();
  const score = lifeScore();

  const cloudSyncLabel = !ready ? 'Verbinde…' : session && !error ? 'Aktiv' : 'Nur lokal';
  const cloudSyncColor = !ready ? colors.textSecondary : session && !error ? colors.success : colors.warning;
  const [faceId, setFaceId] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dailyCheckin, setDailyCheckin] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.firstName);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) updateUserName(trimmed);
    else setNameInput(user.firstName);
    setEditingName(false);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.section}>
          <GlassCard size="hero" style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{user.firstName.charAt(0)}</Text>
            </View>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={styles.nameInput}
                  autoFocus
                  onSubmitEditing={saveName}
                  placeholderTextColor={colors.textTertiary}
                />
                <AnimatedPressable onPress={saveName} hitSlop={8}>
                  <Ionicons name="checkmark-circle" size={26} color={colors.success} />
                </AnimatedPressable>
              </View>
            ) : (
              <AnimatedPressable
                onPress={() => {
                  setNameInput(user.firstName);
                  setEditingName(true);
                }}
                style={styles.nameRow}
              >
                <Text style={styles.name}>{user.firstName}</Text>
                <Ionicons name="pencil" size={14} color={colors.textTertiary} />
              </AnimatedPressable>
            )}
            <Text style={styles.scoreText}>Life Score {score.overall}%</Text>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sicherheit" />
          <GlassCard>
            <SettingsRow icon="finger-print-outline" label="Face ID" kind="toggle" value={faceId} onToggle={setFaceId} iconColor={colors.success} />
            <View style={styles.divider} />
            <SettingsRow icon="cloud-outline" label="Cloud Sync" kind="nav" value={cloudSyncLabel} iconColor={cloudSyncColor} />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Benachrichtigungen" />
          <GlassCard>
            <SettingsRow icon="notifications-outline" label="Push-Benachrichtigungen" kind="toggle" value={notifications} onToggle={setNotifications} />
            <View style={styles.divider} />
            <SettingsRow icon="sunny-outline" label="Täglicher Check-in" kind="toggle" value={dailyCheckin} onToggle={setDailyCheckin} />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="App" />
          <GlassCard>
            <SettingsRow icon="moon-outline" label="Darstellung" kind="nav" value="Dunkel" iconColor={colors.textSecondary} />
            <View style={styles.divider} />
            <SettingsRow icon="download-outline" label="Daten exportieren" kind="nav" iconColor={colors.textSecondary} />
            <View style={styles.divider} />
            <SettingsRow icon="information-circle-outline" label="Über Mylife" kind="nav" value="1.0.0" iconColor={colors.textSecondary} />
          </GlassCard>
        </View>

        <View style={[styles.section, { marginBottom: 0 }]}>
          <GlassCard>
            <SettingsRow icon="log-out-outline" label="Abmelden" kind="nav" iconColor={colors.danger} />
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
  title: {
    ...type.largeTitle,
    color: colors.textPrimary,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  profileCard: {
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: {
    ...type.title1,
    color: colors.accent,
  },
  name: {
    ...type.title2,
    color: colors.textPrimary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    ...type.title2,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 2,
    minWidth: 120,
    textAlign: 'center',
  },
  scoreText: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
});
