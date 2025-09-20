import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

interface StreakCounterProps {
  streakDays: number;
  totalCoins: number;
  totalReadings: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  streakDays,
  totalCoins,
  totalReadings,
}) => {
  const getStreakEmoji = (days: number) => {
    if (days >= 365) return '👑'; // Year crown
    if (days >= 100) return '💎'; // Diamond
    if (days >= 50) return '🏆';  // Trophy (Jubilee)
    if (days >= 30) return '⭐';  // Star
    if (days >= 7) return '🔥';   // Fire
    if (days >= 3) return '💪';   // Strong
    return '🌱'; // Growing
  };

  const getStreakTitle = (days: number) => {
    if (days >= 365) return 'Torah Master';
    if (days >= 100) return 'Devoted Student';
    if (days >= 50) return 'Jubilee Achiever';
    if (days >= 30) return 'Faithful Reader';
    if (days >= 7) return 'Week Warrior';
    if (days >= 3) return 'Building Habit';
    return 'Getting Started';
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.streakSection}>
        <View style={styles.streakIcon}>
          <Typography style={styles.emoji}>
            {getStreakEmoji(streakDays)}
          </Typography>
        </View>
        <View style={styles.streakContent}>
          <Typography variant="h1" style={styles.streakNumber}>
            {streakDays}
          </Typography>
          <Typography variant="body" style={styles.streakLabel}>
            Day Streak
          </Typography>
          <Typography variant="caption" style={styles.streakTitle}>
            {getStreakTitle(streakDays)}
          </Typography>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Typography variant="h3" style={styles.statNumber}>
            {totalCoins}
          </Typography>
          <Typography variant="caption" style={styles.statLabel}>
            🪙 Dominion Coins
          </Typography>
        </View>

        <View style={styles.statItem}>
          <Typography variant="h3" style={styles.statNumber}>
            {totalReadings}
          </Typography>
          <Typography variant="caption" style={styles.statLabel}>
            📖 Torah Readings
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  streakIcon: {
    marginRight: designTokens.spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: designTokens.typography.fontSize['4xl'],
    color: designTokens.colors.secondary.gold,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  streakLabel: {
    color: designTokens.colors.neutral.gray600,
    marginTop: -4,
  },
  streakTitle: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.medium,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: designTokens.colors.neutral.gray200,
    marginVertical: designTokens.spacing.md,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: designTokens.colors.accent.emerald,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  statLabel: {
    textAlign: 'center',
    marginTop: designTokens.spacing.xs,
  },
});