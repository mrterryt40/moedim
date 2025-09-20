import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { designTokens } from '../../theme/tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'torah' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onPress,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const buttonTextStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? designTokens.colors.neutral.white : designTokens.colors.primary.indigo}
        />
      ) : (
        <Text style={buttonTextStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...designTokens.shadows.sm,
  },

  // Variants
  primary: {
    backgroundColor: designTokens.colors.primary.indigo,
  },
  secondary: {
    backgroundColor: designTokens.colors.secondary.gold,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: designTokens.colors.primary.indigo,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  torah: {
    backgroundColor: designTokens.colors.accent.crimson,
  },
  success: {
    backgroundColor: designTokens.colors.success,
  },

  // Sizes
  sm: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.md,
    minHeight: 52,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Text Styles
  baseText: {
    fontFamily: designTokens.typography.fontFamily.sans,
    fontWeight: designTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },

  primaryText: {
    color: designTokens.colors.neutral.white,
  },
  secondaryText: {
    color: designTokens.colors.primary.indigo,
  },
  outlineText: {
    color: designTokens.colors.primary.indigo,
  },
  ghostText: {
    color: designTokens.colors.primary.indigo,
  },
  torahText: {
    color: designTokens.colors.neutral.white,
  },
  successText: {
    color: designTokens.colors.neutral.white,
  },

  smText: {
    fontSize: designTokens.typography.fontSize.sm,
  },
  mdText: {
    fontSize: designTokens.typography.fontSize.base,
  },
  lgText: {
    fontSize: designTokens.typography.fontSize.lg,
  },

  disabledText: {
    opacity: 0.7,
  },
});