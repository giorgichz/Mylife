import React from 'react';
import { StyleProp, StyleSheet, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, type } from '../../theme';
import { AnimatedPressable } from './AnimatedPressable';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, style }: Props) {
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.textPrimary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelDefault]}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.base, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={colors.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
        <>{content}</>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.headline,
  },
  labelPrimary: {
    color: colors.textInverse,
  },
  labelDefault: {
    color: colors.textPrimary,
  },
});
