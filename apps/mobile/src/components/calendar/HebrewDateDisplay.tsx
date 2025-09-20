import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

interface HebrewDateDisplayProps {
  hebrewDate: string;
  gregorianDate: string;
  isShabbat: boolean;
  nextFeast?: {
    name: string;
    daysUntil: number;
  };
}

export const HebrewDateDisplay: React.FC<HebrewDateDisplayProps> = ({
  hebrewDate,
  gregorianDate,
  isShabbat,
  nextFeast,
}) => {
  return (
    <Card variant={isShabbat ? "feast" : "default"} style={styles.container}>
      <View style={styles.dateSection}>
        <Typography variant="hebrew" style={styles.hebrewDate}>
          {hebrewDate}
        </Typography>
        <Typography variant="body" style={styles.gregorianDate}>
          {gregorianDate}
        </Typography>

        {isShabbat && (
          <View style={styles.shabbatBadge}>
            <Typography variant="caption" style={styles.shabbatText}>
              🕯️ Shabbat Shalom
            </Typography>
          </View>
        )}
      </View>

      {nextFeast && (
        <View style={styles.feastSection}>
          <Typography variant="caption" style={styles.nextFeastLabel}>
            Next Appointed Time:
          </Typography>
          <Typography variant="h3" style={styles.feastName}>
            {nextFeast.name}
          </Typography>
          <Typography variant="body" style={styles.daysUntil}>
            {nextFeast.daysUntil} days remaining
          </Typography>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  hebrewDate: {
    fontSize: designTokens.typography.fontSize['2xl'],
    marginBottom: designTokens.spacing.xs,
  },
  gregorianDate: {
    color: designTokens.colors.neutral.gray600,
  },
  shabbatBadge: {
    backgroundColor: designTokens.colors.accent.emerald,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.full,
    marginTop: designTokens.spacing.sm,
  },
  shabbatText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  feastSection: {
    alignItems: 'center',
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.neutral.gray200,
  },
  nextFeastLabel: {
    color: designTokens.colors.neutral.gray500,
    marginBottom: designTokens.spacing.xs,
  },
  feastName: {
    color: designTokens.colors.accent.emerald,
    marginBottom: designTokens.spacing.xs,
  },
  daysUntil: {
    color: designTokens.colors.neutral.gray600,
  },
});