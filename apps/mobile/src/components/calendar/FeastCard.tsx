import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

interface Feast {
  id: string;
  name: string;
  hebrewName: string;
  category: 'major' | 'minor' | 'sabbath';
  startDate: string;
  endDate: string;
  daysUntil: number;
  duration: number;
  description: string;
  significance: string;
  observances: string[];
  scripturalReferences: string[];
  isToday?: boolean;
  isUpcoming?: boolean;
}

interface FeastCardProps {
  feast: Feast;
  onPress?: (feast: Feast) => void;
}

export const FeastCard: React.FC<FeastCardProps> = ({
  feast,
  onPress,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major':
        return designTokens.colors.secondary.gold;
      case 'minor':
        return designTokens.colors.primary.indigo;
      case 'sabbath':
        return designTokens.colors.accent.emerald;
      default:
        return designTokens.colors.neutral.gray500;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'major':
        return 'Major Feast';
      case 'minor':
        return 'Appointed Time';
      case 'sabbath':
        return 'Sabbath';
      default:
        return category;
    }
  };

  const formatDaysUntil = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
    if (days < 365) return `In ${Math.floor(days / 30)} months`;
    return `In ${Math.floor(days / 365)} years`;
  };

  const getStatusEmoji = () => {
    if (feast.isToday) return '🎉';
    if (feast.daysUntil <= 7) return '⏰';
    if (feast.daysUntil <= 30) return '📅';
    return '🗓️';
  };

  const cardVariant = feast.isToday ? 'feast' : feast.isUpcoming ? 'elevated' : 'default';

  return (
    <Pressable onPress={() => onPress?.(feast)}>
      <Card variant={cardVariant} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.nameContainer}>
              <Typography style={styles.emoji}>
                {getStatusEmoji()}
              </Typography>
              <View style={styles.names}>
                <Typography variant="h3" style={[styles.name, feast.isToday && { color: designTokens.colors.secondary.goldDark }]}>
                  {feast.name}
                </Typography>
                <Typography variant="hebrew" style={styles.hebrewName}>
                  {feast.hebrewName}
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(feast.category) }]}>
              <Typography variant="caption" style={styles.categoryText}>
                {getCategoryLabel(feast.category)}
              </Typography>
            </View>
            <Typography variant="caption" style={[
              styles.daysUntil,
              feast.daysUntil <= 7 && { color: designTokens.colors.accent.crimson, fontWeight: designTokens.typography.fontWeight.bold }
            ]}>
              {formatDaysUntil(feast.daysUntil)}
            </Typography>
          </View>
        </View>

        {/* Description */}
        <Typography variant="body" style={styles.description}>
          {feast.description}
        </Typography>

        {/* Duration and Dates */}
        <View style={styles.dateSection}>
          <View style={styles.dateItem}>
            <Typography variant="caption" style={styles.dateLabel}>
              Duration:
            </Typography>
            <Typography variant="body" style={styles.dateValue}>
              {feast.duration} day{feast.duration > 1 ? 's' : ''}
            </Typography>
          </View>
          <View style={styles.dateItem}>
            <Typography variant="caption" style={styles.dateLabel}>
              Starts:
            </Typography>
            <Typography variant="body" style={styles.dateValue}>
              {new Date(feast.startDate).toLocaleDateString()}
            </Typography>
          </View>
        </View>

        {/* Observances Preview */}
        {feast.observances.length > 0 && (
          <View style={styles.observancesSection}>
            <Typography variant="caption" style={styles.observancesLabel}>
              Key Observances:
            </Typography>
            <Typography variant="body" style={styles.observancesText}>
              {feast.observances.slice(0, 2).join(' • ')}
              {feast.observances.length > 2 && ' ...'}
            </Typography>
          </View>
        )}

        {/* Significance */}
        <View style={styles.significanceSection}>
          <Typography variant="caption" style={styles.significanceLabel}>
            Significance:
          </Typography>
          <Typography variant="body" style={styles.significanceText}>
            {feast.significance}
          </Typography>
        </View>

        {/* Today indicator */}
        {feast.isToday && (
          <View style={styles.todayBanner}>
            <Typography variant="caption" style={styles.todayText}>
              🎊 Celebrating Today! 🎊
            </Typography>
          </View>
        )}
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.md,
  },
  titleSection: {
    flex: 1,
    marginRight: designTokens.spacing.md,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: designTokens.spacing.sm,
  },
  names: {
    flex: 1,
  },
  name: {
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.xs,
  },
  hebrewName: {
    color: designTokens.colors.secondary.gold,
    fontSize: designTokens.typography.fontSize.lg,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.xs,
  },
  categoryText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  daysUntil: {
    color: designTokens.colors.neutral.gray600,
  },
  description: {
    color: designTokens.colors.neutral.gray700,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.md,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.neutral.gray50,
    borderRadius: designTokens.borderRadius.md,
    paddingHorizontal: designTokens.spacing.md,
  },
  dateItem: {
    alignItems: 'center',
  },
  dateLabel: {
    color: designTokens.colors.neutral.gray500,
    marginBottom: designTokens.spacing.xs,
  },
  dateValue: {
    color: designTokens.colors.neutral.gray800,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  observancesSection: {
    marginBottom: designTokens.spacing.md,
  },
  observancesLabel: {
    color: designTokens.colors.neutral.gray500,
    marginBottom: designTokens.spacing.xs,
  },
  observancesText: {
    color: designTokens.colors.accent.emerald,
    fontStyle: 'italic',
  },
  significanceSection: {
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.neutral.gray200,
    paddingTop: designTokens.spacing.md,
  },
  significanceLabel: {
    color: designTokens.colors.neutral.gray500,
    marginBottom: designTokens.spacing.xs,
  },
  significanceText: {
    color: designTokens.colors.neutral.gray700,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  todayBanner: {
    backgroundColor: designTokens.colors.secondary.goldLight,
    marginTop: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
  },
  todayText: {
    color: designTokens.colors.secondary.goldDark,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
});