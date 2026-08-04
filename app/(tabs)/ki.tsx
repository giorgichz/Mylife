import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../src/store/useLifeStore';
import { ScreenContainer } from '../../src/components/ui';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ChatBubble } from '../../src/components/domain/ChatBubble';
import { TypingIndicator } from '../../src/components/domain/TypingIndicator';
import { simulateAiReply, AiContext } from '../../src/lib/aiSimulator';
import { derivePsycheInsight } from '../../src/lib/insights';
import { AiMessage } from '../../src/data/types';
import { colors, radius, spacing, type } from '../../src/theme';

const SUGGESTIONS = [
  'Erstelle mir einen Plan für diese Woche',
  'Wie stehe ich beim Führerschein?',
  'Ich möchte mich beruflich verändern',
  'Wie war meine Stimmung zuletzt?',
];

export default function KiScreen() {
  const { aiMessages, addAiMessage, addTasks, moodLogs, applications, drivingLicense, tasks, lifeScore } = useLifeStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<AiMessage>>(null);

  const ctx: AiContext = useMemo(() => {
    const score = lifeScore();
    const daysLeft = drivingLicense.examDate
      ? Math.max(0, Math.ceil((new Date(drivingLicense.examDate).getTime() - Date.now()) / 86400000))
      : null;
    return {
      overallScore: score.overall,
      areaScores: { ausbildung: score.ausbildung, psyche: score.psyche, geld: score.geld, fuehrerschein: score.fuehrerschein },
      theoryProgressPct: drivingLicense.theoryProgressPct,
      examDaysLeft: daysLeft,
      applicationsOpen: applications.filter((a) => a.status === 'gesendet' || a.status === 'gespraech').length,
      savingsRate: 25,
      psycheInsightText: derivePsycheInsight(moodLogs).text,
      openTaskCount: tasks.filter((t) => !t.done).length,
    };
  }, [lifeScore, drivingLicense, applications, moodLogs, tasks]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: AiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    addAiMessage(userMessage);
    setInput('');
    setIsTyping(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    setTimeout(() => {
      const reply = simulateAiReply(trimmed, ctx);
      addAiMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        createdAt: new Date().toISOString(),
        actions: reply.actions,
      });
      setIsTyping(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }, 900);
  };

  const applyAction = (kind: string) => {
    if (kind === 'generate_plan') {
      addTasks([
        { areaKey: 'fuehrerschein', title: 'Theorie: 30 Testfragen üben', done: false },
        { areaKey: 'ausbildung', title: 'Bewerbung Stadtwerke nachfassen', done: false },
        { areaKey: 'psyche', title: 'Um 22:30 Uhr Bildschirmzeit beenden', done: false },
      ]);
    }
    addAiMessage({
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '✅ Erledigt — du findest die Änderungen jetzt in deinen Zielen.',
      createdAt: new Date().toISOString(),
    });
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="sparkles" size={18} color={colors.accent} />
        </View>
        <View>
          <Text style={styles.headerTitle}>KI-Assistent</Text>
          <Text style={styles.headerSubtitle}>Kennt deine Ziele, Stimmung & Finanzen</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={listRef}
          style={styles.messagesList}
          data={aiMessages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} onAction={applyAction} />}
          contentContainerStyle={styles.messages}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {aiMessages.length <= 1 && (
          <FlatList
            data={SUGGESTIONS}
            keyExtractor={(s) => s}
            horizontal
            style={styles.suggestionsList}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestions}
            renderItem={({ item }) => (
              <AnimatedPressable style={styles.suggestionChip} onPress={() => sendMessage(item)}>
                <Text style={styles.suggestionText}>{item}</Text>
              </AnimatedPressable>
            )}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Schreib der KI etwas…"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            multiline
            onSubmitEditing={() => sendMessage(input)}
          />
          <AnimatedPressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons name="arrow-up" size={18} color={colors.textInverse} />
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...type.title2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 1,
  },
  messagesList: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.lg,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  suggestionsList: {
    flexGrow: 0,
    flexShrink: 0,
  },
  suggestions: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  suggestionChip: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  suggestionText: {
    ...type.footnote,
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.tabBarClearance,
  },
  input: {
    flex: 1,
    ...type.body,
    color: colors.textPrimary,
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
