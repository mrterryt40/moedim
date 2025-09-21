import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { designTokens } from '../theme/tokens';
import { calendarService, hebrewService, communityService, marketplaceService } from '../services';

export const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    todayInfo: any;
    progress: any;
    featuredProducts: any[];
    circlesCount: number;
    error: string | null;
  }>({
    todayInfo: null,
    progress: null,
    featuredProducts: [],
    circlesCount: 0,
    error: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load data from multiple services in parallel
      const [todayInfo, progress, featuredProducts, circles] = await Promise.allSettled([
        calendarService.getTodayInfo(),
        hebrewService.getProgress().catch(() => null), // Optional - user might not be logged in
        marketplaceService.getFeaturedProducts(),
        communityService.getCircles().catch(() => []), // Optional - user might not be logged in
      ]);

      setDashboardData({
        todayInfo: todayInfo.status === 'fulfilled' ? todayInfo.value : null,
        progress: progress.status === 'fulfilled' ? progress.value : null,
        featuredProducts: featuredProducts.status === 'fulfilled' ? featuredProducts.value.slice(0, 2) : [],
        circlesCount: circles.status === 'fulfilled' ? circles.value.length : 0,
        error: null,
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
      setDashboardData(prev => ({
        ...prev,
        error: 'Failed to load dashboard data'
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={designTokens.colors.primary.indigo} />
        <Typography variant="body" style={styles.loadingText}>
          Loading dashboard...
        </Typography>
      </View>
    );
  }

  const { todayInfo, progress, featuredProducts, circlesCount } = dashboardData;

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
            {todayInfo?.hebrewDate?.hebrewName || 'Loading...'}
          </Typography>
        </View>

        {todayInfo?.feasts && todayInfo.feasts.length > 0 && (
          <View style={styles.todaySection}>
            <Typography variant="h3" style={styles.todayLabel}>
              Today's Feast
            </Typography>
            <Typography variant="body" style={styles.todayValue}>
              {todayInfo.feasts[0].name}
            </Typography>
          </View>
        )}

        {todayInfo?.nextFeast && (
          <View style={styles.todaySection}>
            <Typography variant="h3" style={styles.todayLabel}>
              Next Feast
            </Typography>
            <Typography variant="body" style={styles.todayValue}>
              {todayInfo.nextFeast.name}
            </Typography>
          </View>
        )}

        {progress && (
          <View style={styles.todaySection}>
            <Typography variant="h3" style={styles.todayLabel}>
              Hebrew Learning Progress
            </Typography>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.completionPercentage || 0}%` }]} />
              </View>
              <Typography variant="caption" style={styles.progressText}>
                {progress.completionPercentage || 0}% complete - {progress.wordsLearned || 0} words learned
              </Typography>
            </View>
          </View>
        )}
      </Card>

      {/* Community Highlights */}
      <Card variant="default" style={styles.communityCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Community Highlights
        </Typography>

        <View style={styles.communityItem}>
          <Typography variant="body" style={styles.communityText}>
            🔥 {circlesCount} active community circles
          </Typography>
        </View>

        {todayInfo?.parasha && (
          <View style={styles.communityItem}>
            <Typography variant="body" style={styles.communityText}>
              📖 This week's Parsha: {todayInfo.parasha.name}
            </Typography>
          </View>
        )}

        <View style={styles.communityItem}>
          <Typography variant="body" style={styles.communityText}>
            🏪 {featuredProducts.length} featured marketplace items
          </Typography>
        </View>
      </Card>

      {/* Marketplace Featured */}
      <Card variant="default" style={styles.featuredCard}>
        <Typography variant="h2" style={styles.sectionTitle}>
          Featured Marketplace Items
        </Typography>

        {featuredProducts.length > 0 ? (
          featuredProducts.map((product, index) => (
            <View key={product.id || index} style={styles.featuredItem}>
              <Typography variant="h3" style={styles.featuredTitle}>
                {product.name}
              </Typography>
              <Typography variant="body" style={styles.featuredPrice}>
                ${product.price?.toFixed(2) || '0.00'}
              </Typography>
            </View>
          ))
        ) : (
          <View style={styles.featuredItem}>
            <Typography variant="body" style={styles.communityText}>
              No featured products available
            </Typography>
          </View>
        )}

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
    color: designTokens.colors.neutral.gray600,
  },
});