import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { designTokens } from '../theme/tokens';

export const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Typography variant="h1" style={styles.welcomeText}>
          שלום! Welcome to Mo'edim
        </Typography>
        <Typography variant="body" style={styles.subtitleText}>
          Your comprehensive platform for Israelite life, learning, and community
        </Typography>
      </View>

      {/* Quick Actions */}
      <Card variant="default" style={styles.quickActionsCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Quick Actions
        </Typography>
        <View style={styles.quickActions}>
          <Button variant="primary" size="small" style={styles.actionButton}>
            📚 Study Hebrew
          </Button>
          <Button variant="secondary" size="small" style={styles.actionButton}>
            📅 View Calendar
          </Button>
          <Button variant="primary" size="small" style={styles.actionButton}>
            🛒 Browse Marketplace
          </Button>
        </View>
      </Card>

      {/* Today's Information */}
      <Card variant="default" style={styles.todayCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Today's Information
        </Typography>

        <View style={styles.todaySection}>
          <Typography variant="h3" style={styles.todayLabel}>
            Hebrew Date
          </Typography>
          <Typography variant="hebrew" style={styles.hebrewDate}>
            כ״ג תשרי ה׳תשפ״ה
          </Typography>
        </View>

        <View style={styles.todaySection}>
          <Typography variant="h3" style={styles.todayLabel}>
            Today's Feast
          </Typography>
          <Typography variant="body" style={styles.todayValue}>
            Simchat Torah Celebration
          </Typography>
        </View>

        <View style={styles.todaySection}>
          <Typography variant="h3" style={styles.todayLabel}>
            Hebrew Learning Progress
          </Typography>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
            <Typography variant="caption" style={styles.progressText}>
              65% complete - 23 words learned this week
            </Typography>
          </View>
        </View>
      </Card>

      {/* Community Highlights */}
      <Card variant="default" style={styles.communityCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Community Highlights
        </Typography>

        <View style={styles.communityItem}>
          <Typography variant="body" style={styles.communityText}>
            🔥 5 new Torah discussions active
          </Typography>
        </View>

        <View style={styles.communityItem}>
          <Typography variant="body" style={styles.communityText}>
            📖 Weekly Parsha study group: Thursday 7 PM
          </Typography>
        </View>

        <View style={styles.communityItem}>
          <Typography variant="body" style={styles.communityText}>
            🏪 12 new marketplace items from local artisans
          </Typography>
        </View>
      </Card>

      {/* Marketplace Featured */}
      <Card variant="default" style={styles.featuredCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Featured Marketplace Items
        </Typography>

        <View style={styles.featuredItem}>
          <Typography variant="h3" style={styles.featuredTitle}>
            🕯️ Handcrafted Sabbath Candles
          </Typography>
          <Typography variant="body" style={styles.featuredPrice}>
            $45.00
          </Typography>
        </View>

        <View style={styles.featuredItem}>
          <Typography variant="h3" style={styles.featuredTitle}>
            📖 Hebrew Learning Flashcards
          </Typography>
          <Typography variant="body" style={styles.featuredPrice}>
            $25.00
          </Typography>
        </View>

        <Button variant="secondary" size="small" style={styles.viewMoreButton}>
          View All Products
        </Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.neutral.gray50,
  },
  content: {
    padding: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
  },
  header: {
    marginBottom: designTokens.spacing.lg,
    alignItems: 'center',
  },
  welcomeText: {
    textAlign: 'center',
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.sm,
  },
  subtitleText: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  quickActionsCard: {
    marginBottom: designTokens.spacing.lg,
  },
  sectionTitle: {
    color: designTokens.colors.neutral.gray800,
    marginBottom: designTokens.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  todayCard: {
    marginBottom: designTokens.spacing.lg,
  },
  todaySection: {
    marginBottom: designTokens.spacing.md,
  },
  todayLabel: {
    color: designTokens.colors.neutral.gray700,
    marginBottom: designTokens.spacing.xs,
  },
  todayValue: {
    color: designTokens.colors.neutral.gray800,
    fontSize: designTokens.typography.fontSize.lg,
  },
  hebrewDate: {
    color: designTokens.colors.secondary.gold,
    fontSize: designTokens.typography.fontSize.xl,
  },
  progressContainer: {
    marginTop: designTokens.spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: designTokens.colors.neutral.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: designTokens.colors.primary.indigo,
  },
  progressText: {
    color: designTokens.colors.neutral.gray600,
  },
  communityCard: {
    marginBottom: designTokens.spacing.lg,
  },
  communityItem: {
    marginBottom: designTokens.spacing.sm,
  },
  communityText: {
    color: designTokens.colors.neutral.gray700,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  featuredCard: {
    marginBottom: designTokens.spacing.lg,
  },
  featuredItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.neutral.gray200,
  },
  featuredTitle: {
    flex: 1,
    color: designTokens.colors.neutral.gray800,
  },
  featuredPrice: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  viewMoreButton: {
    marginTop: designTokens.spacing.sm,
  },
});