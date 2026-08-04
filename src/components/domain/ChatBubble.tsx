import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AiMessage, AiToolAction } from '../../data/types';
import { colors, radius, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

export function ChatBubble({ message, onAction }: { message: AiMessage; onAction?: (action: AiToolAction) => void }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
        {isUser ? (
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleUser]}
          >
            <Text style={styles.textUser}>{message.content}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleAssistant]}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.bubbleAssistantTint]} />
            <Text style={styles.textAssistant}>{message.content}</Text>
          </View>
        )}
        {message.actions && message.actions.length > 0 && (
          <View style={styles.actions}>
            {message.actions.map((action) => (
              <AnimatedPressable key={action.label} onPress={() => onAction?.(action)} style={styles.actionChip}>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubbleWrap: {
    maxWidth: '84%',
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorder,
  },
  bubbleAssistantTint: {
    backgroundColor: colors.glassFill,
  },
  textUser: {
    ...type.body,
    color: colors.textInverse,
  },
  textAssistant: {
    ...type.body,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
});
