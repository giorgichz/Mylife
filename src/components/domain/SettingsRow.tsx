import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
} & (
  | { kind: 'toggle'; value: boolean; onToggle: (v: boolean) => void }
  | { kind: 'nav'; onPress?: () => void; value?: string }
);

export function SettingsRow(props: Props) {
  const { icon, label, iconColor = colors.accent } = props;

  return (
    <AnimatedPressable
      style={styles.row}
      onPress={props.kind === 'nav' ? props.onPress : undefined}
      disabled={props.kind === 'toggle'}
      scaleTo={0.99}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {props.kind === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onToggle}
          trackColor={{ false: colors.glassFillStrong, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View style={styles.navRight}>
          {props.value && <Text style={styles.navValue}>{props.value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...type.body,
    color: colors.textPrimary,
    flex: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navValue: {
    ...type.footnote,
    color: colors.textTertiary,
  },
});
