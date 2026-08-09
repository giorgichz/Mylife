import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAiAssistant } from '../../lib/useAiAssistant';
import { colors, radius, spacing, type } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { TypingIndicator } from './TypingIndicator';

const PLACEHOLDERS = [
  'Was steht heute an?',
  'Ich möchte …',
  'Trag ein, was dir grad im Kopf ist',
];

/**
 * The "don't make me search for where to type" entry point — lives right
 * at the top of Home. Goes through the same intent engine as the KI tab
 * (same message history too), just answered inline instead of on its own screen.
 */
export function QuickCapture() {
  const { aiMessages, isTyping, sendMessage, applyAction } = useAiAssistant();
  const [input, setInput] = useState('');
  const [justSent, setJustSent] = useState(false);

  const lastAssistantMessage = justSent ? [...aiMessages].reverse().find((m) => m.role === 'assistant') : undefined;

  const handleSend = () => {
    if (!input.trim()) return;
    setJustSent(true);
    sendMessage(input);
    setInput('');
  };

  return (
    <View>
      <GlassCard style={styles.card}>
        <View style={styles.inputRow}>
          <Ionicons name="sparkles" size={16} color={colors.accent} style={styles.sparkle} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={PLACEHOLDERS[0]}
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <AnimatedPressable
            onPress={handleSend}
            disabled={!input.trim()}
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons name="arrow-up" size={16} color={colors.textInverse} />
          </AnimatedPressable>
        </View>

        {isTyping && (
          <View style={styles.replyWrap}>
            <TypingIndicator />
          </View>
        )}

        {!isTyping && lastAssistantMessage && (
          <View style={styles.replyWrap}>
            <Text style={styles.replyText}>{lastAssistantMessage.content}</Text>
            {lastAssistantMessage.actions?.map((action) => (
              <AnimatedPressable
                key={action.label}
                onPress={() => applyAction(action)}
                style={styles.actionChip}
              >
                <Text style={styles.actionLabel}>{action.label}</Text>
              </AnimatedPressable>
            ))}
            <AnimatedPressable onPress={() => router.push('/(tabs)/ki')} hitSlop={6}>
              <Text style={styles.chatLink}>Ganzer Chat →</Text>
            </AnimatedPressable>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenX,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sparkle: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    ...type.body,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  replyWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  replyText: {
    ...type.callout,
    color: colors.textSecondary,
  },
  actionChip: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  actionLabel: {
    ...type.footnote,
    color: colors.accent,
  },
  chatLink: {
    ...type.footnote,
    color: colors.textTertiary,
  },
});
