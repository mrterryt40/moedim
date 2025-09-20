import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

interface HebrewCardProps {
  card: {
    id: string;
    hebrew: string;
    english: string;
    transliteration: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    gematria?: number;
    rootWord?: string;
    usage?: string;
  };
  onReview: (cardId: string, quality: number) => void;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}

export const HebrewCard: React.FC<HebrewCardProps> = ({
  card,
  onReview,
  showAnswer,
  onToggleAnswer,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return designTokens.colors.accent.emerald;
      case 'intermediate':
        return designTokens.colors.secondary.gold;
      case 'advanced':
        return designTokens.colors.accent.crimson;
      default:
        return designTokens.colors.neutral.gray500;
    }
  };

  const qualityButtons = [
    { value: 0, label: 'Again', color: designTokens.colors.accent.crimson, description: 'Complete blackout' },
    { value: 1, label: 'Hard', color: designTokens.colors.secondary.goldDark, description: 'Incorrect, but remembered' },
    { value: 3, label: 'Good', color: designTokens.colors.primary.indigo, description: 'Correct with effort' },
    { value: 5, label: 'Easy', color: designTokens.colors.accent.emerald, description: 'Perfect recall' },
  ];

  return (
    <Card variant="hebrew" style={styles.container}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Typography variant="caption" style={styles.categoryText}>
            {card.category}
          </Typography>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(card.difficulty) }]}>
          <Typography variant="caption" style={styles.difficultyText}>
            {card.difficulty}
          </Typography>
        </View>
      </View>

      {/* Hebrew Word */}
      <Pressable onPress={onToggleAnswer} style={styles.cardContent}>
        <View style={styles.hebrewSection}>
          <Typography variant="hebrew" style={styles.hebrewText}>
            {card.hebrew}
          </Typography>
          <Typography variant="body" style={styles.transliteration}>
            {card.transliteration}
          </Typography>
        </View>

        {/* Answer Section */}
        {showAnswer && (
          <View style={styles.answerSection}>
            <View style={styles.divider} />

            <Typography variant="h2" style={styles.englishText}>
              {card.english}
            </Typography>

            {card.gematria && (
              <View style={styles.detailRow}>
                <Typography variant="caption" style={styles.detailLabel}>
                  Gematria:
                </Typography>
                <Typography variant="body" style={styles.detailValue}>
                  {card.gematria}
                </Typography>
              </View>
            )}

            {card.rootWord && (
              <View style={styles.detailRow}>
                <Typography variant="caption" style={styles.detailLabel}>
                  Root:
                </Typography>
                <Typography variant="hebrew" style={styles.rootText}>
                  {card.rootWord}
                </Typography>
              </View>
            )}

            {card.usage && (
              <View style={styles.usageSection}>
                <Typography variant="caption" style={styles.detailLabel}>
                  Usage:
                </Typography>
                <Typography variant="body" style={styles.usageText}>
                  {card.usage}
                </Typography>
              </View>
            )}
          </View>
        )}
      </Pressable>

      {/* Review Buttons */}
      {showAnswer && (
        <View style={styles.reviewSection}>
          <Typography variant="caption" style={styles.reviewLabel}>
            How well did you know this word?
          </Typography>
          <View style={styles.buttonRow}>
            {qualityButtons.map((button) => (
              <View key={button.value} style={styles.buttonContainer}>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => onReview(card.id, button.value)}
                  style={[styles.qualityButton, { borderColor: button.color }]}
                >
                  <Typography variant="caption" style={[styles.buttonLabel, { color: button.color }]}>
                    {button.label}
                  </Typography>
                </Button>
                <Typography variant="caption" style={styles.buttonDescription}>
                  {button.description}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tap to reveal hint */}
      {!showAnswer && (
        <View style={styles.hintSection}>
          <Typography variant="caption" style={styles.hintText}>
            👆 Tap to reveal answer
          </Typography>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.md,
  },
  categoryBadge: {
    backgroundColor: designTokens.colors.neutral.gray200,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.md,
  },
  categoryText: {
    color: designTokens.colors.neutral.gray700,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  difficultyBadge: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.md,
  },
  difficultyText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  cardContent: {
    minHeight: 150,
  },
  hebrewSection: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xl,
  },
  hebrewText: {
    fontSize: designTokens.typography.fontSize['4xl'],
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  transliteration: {
    color: designTokens.colors.neutral.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  answerSection: {
    marginTop: designTokens.spacing.md,
  },
  divider: {
    height: 2,
    backgroundColor: designTokens.colors.secondary.goldLight,
    marginVertical: designTokens.spacing.md,
  },
  englishText: {
    textAlign: 'center',
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  detailLabel: {
    color: designTokens.colors.neutral.gray500,
    marginRight: designTokens.spacing.sm,
    minWidth: 60,
  },
  detailValue: {
    color: designTokens.colors.neutral.gray700,
    flex: 1,
  },
  rootText: {
    color: designTokens.colors.secondary.gold,
    fontSize: designTokens.typography.fontSize.lg,
    flex: 1,
  },
  usageSection: {
    marginTop: designTokens.spacing.sm,
  },
  usageText: {
    color: designTokens.colors.neutral.gray700,
    fontStyle: 'italic',
    marginTop: designTokens.spacing.xs,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  reviewSection: {
    marginTop: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.neutral.gray200,
  },
  reviewLabel: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
    marginBottom: designTokens.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: designTokens.spacing.xs,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  qualityButton: {
    width: '100%',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonLabel: {
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  buttonDescription: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray500,
    marginTop: designTokens.spacing.xs,
    fontSize: designTokens.typography.fontSize.xs,
  },
  hintSection: {
    alignItems: 'center',
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.neutral.gray200,
  },
  hintText: {
    color: designTokens.colors.neutral.gray500,
    fontStyle: 'italic',
  },
});