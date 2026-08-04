import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader } from '../../src/components/ui';
import { SettingsRow } from '../../src/components/domain/SettingsRow';
import { colors, spacing, type } from '../../src/theme';

export default function ProfilScreen() {
  const { user, lifeScore } = useLifeStore();
  const score = lifeScore();
  const [faceId, setFaceId] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dailyCheckin, setDailyCheckin] = useState(true);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.section}>
          <GlassCard size="hero" style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{user.firstName.charAt(0)}</Text>
            </View>
            <Text style={styles.name}>{user.firstName}</Text>
            <Text style={styles.scoreText}>Life Score {score.overall}%</Text>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sicherheit" />
          <GlassCard>
            <SettingsRow icon="finger-print-outline" label="Face ID" kind="toggle" value={faceId} onToggle={setFaceId} iconColor={colors.success} />
            <View style={styles.divider} />
            <SettingsRow icon="cloud-outline" label="Cloud Sync" kind="nav" value="Aktiv" />
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
