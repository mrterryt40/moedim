import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';
import type { HebrewStats } from '../../types';

interface LearningProgressProps {
  progress: HebrewStats;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  progress,
}) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return designTokens.colors.accent.emerald;
    if (accuracy >= 80) return designTokens.colors.secondary.gold;
    if (accuracy >= 70) return designTokens.colors.primary.indigo;
    return designTokens.colors.accent.crimson;
  };

  const getLevelEmoji = (level: number) => {
    if (level >= 10) return '👑'; // Crown
    if (level >= 8) return '🌟';  // Star
    if (level >= 6) return '💎';  // Diamond
    if (level >= 4) return '🏆';  // Trophy
    if (level >= 2) return '🔥';  // Fire
    return '🌱'; // Seedling
  };

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Hebrew Master';
    if (level >= 8) return 'Torah Scholar';
    if (level >= 6) return 'Devoted Student';
    if (level >= 4) return 'Diligent Learner';
    if (level >= 2) return 'Growing Student';
    return 'Beginning Student';
  };

  // Extract values with defaults
  const {
    totalCards = 0,
    reviewedToday = 0,
    dueCards = 0,
    newCards = 0,
    masteredCards = 0,
    streakDays = 0,
    accuracy = 0,
    completionPercentage = 0
  } = progress;

  // Calculate level based on mastered cards
  const currentLevel = Math.floor(masteredCards / 10) + 1;

  const formatNextReview = (nextReviewTime?: string) => {
    if (!nextReviewTime) return 'No reviews scheduled';

    const now = new Date();
    const reviewTime = new Date(nextReviewTime);
    const diffMs = reviewTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Reviews available now!';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `Next review in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    if (diffHours > 0) {
      return `Next review in ${diffHours}h ${diffMinutes}m`;
    }

    return `Next review in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  };

  return (
    <Card variant="elevated" style={styles.container}>
      {/* Level Section */}
      <View style={styles.levelSection}>
        <View style={styles.levelIcon}>
          <Typography style={styles.levelEmoji}>
            {getLevelEmoji(currentLevel)}
          </Typography>
        </View>
        <View style={styles.levelContent}>
          <Typography variant="h2" style={styles.levelNumber}>
            Level {currentLevel}
          </Typography>
          <Typography variant="body" style={styles.levelTitle}>
            {getLevelTitle(currentLevel)}
          </Typography>
        </View>
        <View style={styles.accuracyBadge}>
          <Typography variant="h3" style={[styles.accuracyText, { color: getAccuracyColor(accuracy) }]}>
            {accuracy}%
          </Typography>
          <Typography variant="caption" style={styles.accuracyLabel}>
            Accuracy
          </Typography>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Progress Grid */}
      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Typography variant="h3" style={[styles.progressNumber, { color: designTokens.colors.accent.emerald }]}>
            {reviewedToday}
          </Typography>
          <Typography variant="caption" style={styles.progressLabel}>
            Reviewed Today
          </Typography>
        </View>

        <View style={styles.progressItem}>
          <Typography variant="h3" style={[styles.progressNumber, { color: designTokens.colors.accent.crimson }]}>
            {dueCards}
          </Typography>
          <Typography variant="caption" style={styles.progressLabel}>
            Due Now
          </Typography>
        </View>

        <View style={styles.progressItem}>
          <Typography variant="h3" style={[styles.progressNumber, { color: designTokens.colors.primary.indigo }]}>
            {newCards}
          </Typography>
          <Typography variant="caption" style={styles.progressLabel}>
            New Cards
          </Typography>
        </View>

        <View style={styles.progressItem}>
          <Typography variant="h3" style={[styles.progressNumber, { color: designTokens.colors.secondary.gold }]}>
            {masteredCards}
          </Typography>
          <Typography variant="caption" style={styles.progressLabel}>
            Mastered
          </Typography>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Next Review Section */}
      <View style={styles.nextReviewSection}>
        <Typography variant="caption" style={styles.nextReviewLabel}>
          📅 No reviews scheduled
        </Typography>
        {streakDays > 0 && (
          <Typography variant="caption" style={styles.streakText}>
            🔥 {streakDays} day learning streak
          </Typography>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarSection}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min((masteredCards / Math.max(totalCards, 1)) * 100, 100)}%`,
                backgroundColor: designTokens.colors.secondary.gold
              }
            ]}
          />
        </View>
        <Typography variant="caption" style={styles.progressBarLabel}>
          {progress.masteredCards} of {progress.totalCards} cards mastered
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  levelIcon: {
    marginRight: designTokens.spacing.md,
  },
  levelEmoji: {
    fontSize: 40,
  },
  levelContent: {
    flex: 1,
  },
  levelNumber: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  levelTitle: {
    color: designTokens.colors.neutral.gray600,
    marginTop: -2,
  },
  accuracyBadge: {
    alignItems: 'center',
  },
  accuracyText: {
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  accuracyLabel: {
    color: designTokens.colors.neutral.gray500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: designTokens.colors.neutral.gray200,
    marginVertical: designTokens.spacing.md,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  progressLabel: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
    marginTop: designTokens.spacing.xs,
  },
  nextReviewSection: {
    alignItems: 'center',
  },
  nextReviewLabel: {
    color: designTokens.colors.neutral.gray600,
    marginBottom: designTokens.spacing.xs,
  },
  streakText: {
    color: designTokens.colors.accent.emerald,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  progressBarSection: {
    marginTop: designTokens.spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: designTokens.colors.neutral.gray200,
    borderRadius: designTokens.borderRadius.full,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: designTokens.borderRadius.full,
  },
  progressBarLabel: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
  },
});