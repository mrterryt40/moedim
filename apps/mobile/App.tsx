import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { torahService, hebrewService, calendarService, marketplaceService, communityService, apiService } from './src/services';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [hebrewProgress, setHebrewProgress] = useState({ completionPercentage: 0, wordsLearned: 0 });
  const [todayInfo, setTodayInfo] = useState({ hebrewDate: '', isShabbat: false, upcomingFeasts: [] });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading Mo\'edim data...');

      // Test API connection first
      console.log('📡 API Base URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000');

      // Load Hebrew progress
      try {
        const progress = await hebrewService.getStats();
        setHebrewProgress(progress);
        console.log('✅ Hebrew progress loaded:', progress);
      } catch (error) {
        console.log('⚠️ Hebrew progress failed, using defaults');
        setHebrewProgress({ completionPercentage: 65, wordsLearned: 23 });
      }

      // Load today's calendar info
      try {
        const hebrewDate = await calendarService.getHebrewDate();
        const upcomingFeasts = await calendarService.getUpcomingFeasts();
        setTodayInfo({
          hebrewDate: hebrewDate.hebrewName || 'כ״ג תשרי ה׳תשפ״ה',
          isShabbat: hebrewDate.isShabbat,
          upcomingFeasts
        });
        console.log('✅ Calendar data loaded');
      } catch (error) {
        console.log('⚠️ Calendar data failed, using defaults');
        setTodayInfo({
          hebrewDate: 'כ״ג תשרי ה׳תשפ״ה',
          isShabbat: false,
          upcomingFeasts: []
        });
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Button handlers
  const handleStudyHebrew = async () => {
    try {
      setLoading(true);
      const reviewCards = await hebrewService.getReviewCards();
      Alert.alert('Hebrew Study', `You have ${reviewCards.length} cards to review!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load Hebrew study cards. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCalendar = async () => {
    try {
      setLoading(true);
      const sabbathTimes = await calendarService.getSabbathTimes();
      Alert.alert('Sabbath Times', `Next Sabbath: ${sabbathTimes.start} - ${sabbathTimes.end}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load calendar information. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseMarketplace = async () => {
    try {
      setLoading(true);
      const products = await marketplaceService.getProducts();
      Alert.alert('Marketplace', `Found ${products.length} products available for purchase!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load marketplace. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      setLoading(true);
      const circles = await communityService.getCircles();
      Alert.alert('Community', `Found ${circles.length} active community circles to join!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load community information. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDiscussions = async () => {
    try {
      setLoading(true);
      const circles = await communityService.getCircles();
      Alert.alert('Discussions', `Join one of ${circles.length} active discussion circles!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load discussions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = async () => {
    try {
      setLoading(true);
      const featured = await marketplaceService.getFeaturedProducts();
      Alert.alert('Featured Products', `Browse ${featured.length} featured items in our marketplace!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🕊️ Mo'edim</Text>
        <Text style={styles.headerSubtitle}>Israelite Life & Learning</Text>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>שלום! Welcome to Mo'edim</Text>
          <Text style={styles.welcomeSubtitle}>
            Your comprehensive platform for Israelite life, learning, and community
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Pressable
              style={[styles.actionButton, styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleStudyHebrew}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>📚 Study Hebrew</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.secondaryButton, loading && styles.disabledButton]}
              onPress={handleViewCalendar}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>📅 View Calendar</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleBrowseMarketplace}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>🛒 Browse Marketplace</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.secondaryButton, loading && styles.disabledButton]}
              onPress={handleJoinCommunity}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>👥 Join Community</Text>
            </Pressable>
          </View>
        </View>

        {/* Today's Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Information</Text>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Hebrew Date</Text>
            <Text style={styles.hebrewDate}>{todayInfo.hebrewDate || 'כ״ג תשרי ה׳תשפ״ה'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Today's Feast</Text>
            <View style={styles.feastInfo}>
              <View style={styles.activeBadge}>
                <Text style={styles.badgeText}>🎉 Active</Text>
              </View>
              <Text style={styles.feastName}>Simchat Torah Celebration</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Hebrew Learning Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${hebrewProgress.completionPercentage || 0}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {hebrewProgress.completionPercentage || 0}% complete - {hebrewProgress.wordsLearned || 0} words learned this week
              </Text>
            </View>
          </View>
        </View>

        {/* Community Highlights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Highlights</Text>

          <View style={styles.communityItem}>
            <Text style={styles.communityText}>🔥 5 new Torah discussions active</Text>
          </View>

          <View style={styles.communityItem}>
            <Text style={styles.communityText}>📖 Weekly Parsha study group: Thursday 7 PM</Text>
          </View>

          <View style={styles.communityItem}>
            <Text style={styles.communityText}>🏪 12 new marketplace items from local artisans</Text>
          </View>

          <Pressable
            style={[styles.actionButton, styles.primaryButton, styles.fullWidthButton, loading && styles.disabledButton]}
            onPress={handleJoinDiscussions}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>Join Discussions</Text>
          </Pressable>
        </View>

        {/* Featured Marketplace */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Featured Marketplace</Text>

          <View style={styles.featuredItem}>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>🕯️ Handcrafted Sabbath Candles</Text>
              <Text style={styles.featuredDescription}>Premium beeswax</Text>
            </View>
            <Text style={styles.featuredPrice}>$45.00</Text>
          </View>

          <View style={styles.featuredItem}>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>📖 Hebrew Learning Flashcards</Text>
              <Text style={styles.featuredDescription}>500 essential words</Text>
            </View>
            <Text style={styles.featuredPrice}>$25.00</Text>
          </View>

          <View style={styles.featuredItem}>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>🍷 Kosher Wine Set</Text>
              <Text style={styles.featuredDescription}>3 bottles collection</Text>
            </View>
            <Text style={styles.featuredPrice}>$89.00</Text>
          </View>

          <Pressable
            style={[styles.actionButton, styles.secondaryButton, styles.fullWidthButton, loading && styles.disabledButton]}
            onPress={handleViewProducts}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>View All Products</Text>
          </Pressable>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
  },
  secondaryButton: {
    backgroundColor: '#f59e0b',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  hebrewDate: {
    fontSize: 24,
    fontWeight: '500',
    color: '#f59e0b',
    textAlign: 'center',
  },
  feastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  feastName: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  communityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  communityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  featuredItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  featuredDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
});
