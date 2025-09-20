import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { designTokens } from '../../theme/tokens';

interface CardProps {
  variant?: 'default' | 'torah' | 'hebrew' | 'feast' | 'elevated';
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    style
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: designTokens.colors.neutral.white,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
  },

  default: {
    ...designTokens.shadows.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.gray200,
  },

  torah: {
    ...designTokens.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: designTokens.colors.accent.crimson,
    backgroundColor: designTokens.colors.neutral.cream,
  },

  hebrew: {
    ...designTokens.shadows.sm,
    borderTopWidth: 3,
    borderTopColor: designTokens.colors.secondary.gold,
  },

  feast: {
    ...designTokens.shadows.md,
    backgroundColor: designTokens.colors.accent.emerald + '10', // 10% opacity
    borderWidth: 2,
    borderColor: designTokens.colors.accent.emerald,
  },

  elevated: {
    ...designTokens.shadows.lg,
    backgroundColor: designTokens.colors.neutral.white,
  }
});