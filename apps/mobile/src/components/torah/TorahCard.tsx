import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { designTokens } from '../../theme/tokens';

interface TorahCardProps {
  portion: {
    nameEnglish: string;
    nameHebrew: string;
    content: {
      english: string;
      hebrew: string;
      transliteration?: string;
      commentary?: string;
    };
  };
  onComplete?: () => void;
  isCompleted?: boolean;
  coinReward?: number;
}

export const TorahCard: React.FC<TorahCardProps> = ({
  portion,
  onComplete,
  isCompleted = false,
  coinReward = 10,
}) => {
  return (
    <Card variant="torah" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" style={styles.englishTitle}>
          {portion.nameEnglish}
        </Typography>
        <Typography variant="hebrew" style={styles.hebrewTitle}>
          {portion.nameHebrew}
        </Typography>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* English Text */}
        <Typography variant="body" style={styles.englishText}>
          {portion.content.english}
        </Typography>

        {/* Hebrew Text */}
        <Typography variant="hebrew" style={styles.hebrewText}>
          {portion.content.hebrew}
        </Typography>

        {/* Transliteration */}
        {portion.content.transliteration && (
          <Typography variant="caption" style={styles.transliteration}>
            {portion.content.transliteration}
          </Typography>
        )}

        {/* Commentary */}
        {portion.content.commentary && (
          <View style={styles.commentaryContainer}>
            <Typography variant="h3" style={styles.commentaryTitle}>
              Commentary
            </Typography>
            <Typography variant="body" style={styles.commentary}>
              {portion.content.commentary}
            </Typography>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          variant={isCompleted ? "success" : "torah"}
          size="lg"
          onPress={onComplete}
          disabled={isCompleted}
          style={styles.completeButton}
        >
          {isCompleted
            ? "✅ Completed Today"
            : `Complete Reading (+${coinReward} coins)`
          }
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.secondary.gold + '30',
  },
  englishTitle: {
    textAlign: 'center',
    marginBottom: designTokens.spacing.xs,
  },
  hebrewTitle: {
    textAlign: 'center',
    fontSize: designTokens.typography.fontSize['2xl'],
  },
  content: {
    marginBottom: designTokens.spacing.lg,
  },
  englishText: {
    marginBottom: designTokens.spacing.md,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  hebrewText: {
    marginBottom: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.neutral.cream,
    borderRadius: designTokens.borderRadius.sm,
    paddingHorizontal: designTokens.spacing.sm,
  },
  transliteration: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: designTokens.spacing.md,
  },
  commentaryContainer: {
    backgroundColor: designTokens.colors.secondary.gold + '10',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: designTokens.colors.secondary.gold,
  },
  commentaryTitle: {
    marginBottom: designTokens.spacing.xs,
    color: designTokens.colors.secondary.goldDark,
  },
  commentary: {
    color: designTokens.colors.neutral.gray700,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: designTokens.spacing.md,
  },
  completeButton: {
    width: '100%',
  },
});