import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { designTokens } from '../../theme/tokens';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'hebrew' | 'verse';
  color?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const getTextStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'hebrew':
        return styles.hebrew;
      case 'verse':
        return styles.verse;
      case 'caption':
        return styles.caption;
      default:
        return styles.body;
    }
  };

  const textColor = color || getTextStyle().color;

  return (
    <Text
      style={[
        getTextStyle(),
        textColor ? { color: textColor } : {},
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: designTokens.typography.fontFamily.serif,
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['3xl'],
    color: designTokens.colors.primary.indigo,
  },
  h2: {
    fontFamily: designTokens.typography.fontFamily.serif,
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.semibold,
    lineHeight: designTokens.typography.lineHeight.tight * designTokens.typography.fontSize['2xl'],
    color: designTokens.colors.primary.indigo,
  },
  h3: {
    fontFamily: designTokens.typography.fontFamily.sans,
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold,
    lineHeight: designTokens.typography.lineHeight.normal * designTokens.typography.fontSize.xl,
    color: designTokens.colors.primary.indigo,
  },
  body: {
    fontFamily: designTokens.typography.fontFamily.sans,
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.normal,
    lineHeight: designTokens.typography.lineHeight.normal * designTokens.typography.fontSize.base,
    color: designTokens.colors.neutral.gray700,
  },
  hebrew: {
    fontFamily: designTokens.typography.fontFamily.hebrew,
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.normal,
    lineHeight: designTokens.typography.lineHeight.hebrew * designTokens.typography.fontSize.lg,
    color: designTokens.colors.torah.hebrew,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  verse: {
    fontFamily: designTokens.typography.fontFamily.serif,
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.medium,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.lg,
    color: designTokens.colors.accent.crimson,
    fontStyle: 'italic',
  },
  caption: {
    fontFamily: designTokens.typography.fontFamily.sans,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.normal,
    lineHeight: designTokens.typography.lineHeight.normal * designTokens.typography.fontSize.sm,
    color: designTokens.colors.neutral.gray500,
  }
});