import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLifeStore } from '../../../src/store/useLifeStore';
import { ScreenContainer, GlassCard, SectionHeader, Button } from '../../../src/components/ui';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { DomainHeader } from '../../../src/components/domain/DomainHeader';
import { colors, spacing, type } from '../../../src/theme';
import { formatShortDate } from '../../../src/lib/greeting';

const currency = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

export default function GeldScreen() {
  const { accounts, transactions, budgets, lifeScore } = useLifeStore();
  const score = lifeScore();

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const income = useMemo(() => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const expenses = useMemo(() => Math.abs(transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)), [transactions]);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return (
    <ScreenContainer>
      <DomainHeader title="Geld" area="geld" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <GlassCard size="hero">
            <Text style={styles.balanceLabel}>Gesamtvermögen</Text>
            <Text style={styles.balanceValue}>{currency(totalBalance)}</Text>
            <View style={styles.divider} />
            <View style={styles.monthRow}>
              <View style={styles.monthStat}>
                <Ionicons name="arrow-down-circle-outline" size={16} color={colors.success} />
                <View>
                  <Text style={styles.monthValue}>{currency(income)}</Text>
                  <Text style={styles.monthLabel}>Einnahmen</Text>
                </View>
              </View>
              <View style={styles.monthStat}>
                <Ionicons name="arrow-up-circle-outline" size={16} color={colors.danger} />
                <View>
                  <Text style={styles.monthValue}>{currency(expenses)}</Text>
                  <Text style={styles.monthLabel}>Ausgaben</Text>
                </View>
              </View>
              <View style={styles.monthStat}>
                <Ionicons name="trending-up-outline" size={16} color={colors.accent} />
                <View>
                  <Text style={styles.monthValue}>{savingsRate}%</Text>
                  <Text style={styles.monthLabel}>Sparquote</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Konten" />
          {accounts.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="link-outline" size={20} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Noch kein Konto verbunden.</Text>
              <Button label="Konto verbinden" variant="secondary" onPress={() => {}} />
            </GlassCard>
          ) : (
            <View style={styles.list}>
              {accounts.map((acc) => (
                <GlassCard key={acc.id} style={styles.accountRow}>
                  <View style={styles.accountIconWrap}>
                    <Ionicons name="business-outline" size={16} color={colors.area.geld} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountInstitution}>{acc.institution}</Text>
                  </View>
                  <Text style={styles.accountBalance}>{currency(acc.balance)}</Text>
                </GlassCard>
              ))}
            </View>
          )}
        </View>

        {budgets.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Budgets" />
            <GlassCard style={styles.card}>
              {budgets.map((b, i) => {
                const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                const over = b.spent > b.limit;
                return (
                  <React.Fragment key={b.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.budgetRow}>
                      <View style={styles.budgetHeader}>
                        <Text style={styles.budgetCategory}>{b.category}</Text>
                        <Text style={[styles.budgetAmount, over && { color: colors.danger }]}>
                          {currency(b.spent)} / {currency(b.limit)}
                        </Text>
                      </View>
                      <ProgressBar value={pct} color={over ? colors.danger : colors.area.geld} />
                    </View>
                  </React.Fragment>
                );
              })}
            </GlassCard>
          </View>
        )}

        {transactions.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Letzte Transaktionen" />
            <GlassCard style={styles.card}>
              {transactions.slice(0, 5).map((tx, i) => (
                <React.Fragment key={tx.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.txRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txMerchant}>{tx.merchant}</Text>
                      <Text style={styles.txMeta}>
                        {tx.category} · {formatShortDate(tx.date)}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.textPrimary }]}>
                      {tx.amount > 0 ? '+' : ''}
                      {currency(tx.amount)}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </GlassCard>
          </View>
        )}

        <View style={[styles.section, { marginBottom: 0 }]}>
          <SectionHeader title="Geld-Score" />
          <GlassCard style={styles.card}>
            <Text style={styles.scoreValue}>{score.geld}%</Text>
            <Text style={styles.scoreHint}>Budget-Einhaltung, Sparquote und Puffer kombiniert.</Text>
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
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  card: {},
  balanceLabel: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  balanceValue: {
    ...type.numeric,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginVertical: spacing.lg,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthValue: {
    ...type.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  monthLabel: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
  },
  list: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    ...type.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${colors.area.geld}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    ...type.headline,
    color: colors.textPrimary,
  },
  accountInstitution: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  accountBalance: {
    ...type.headline,
    color: colors.textPrimary,
  },
  budgetRow: {
    paddingVertical: 10,
    gap: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetCategory: {
    ...type.callout,
    color: colors.textPrimary,
  },
  budgetAmount: {
    ...type.footnote,
    color: colors.textSecondary,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.md,
  },
  txMerchant: {
    ...type.callout,
    color: colors.textPrimary,
  },
  txMeta: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: 2,
  },
  txAmount: {
    ...type.callout,
    fontWeight: '600',
  },
  scoreValue: {
    ...type.title1,
    color: colors.textPrimary,
  },
  scoreHint: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
