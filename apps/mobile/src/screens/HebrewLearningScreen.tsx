import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { HebrewCard } from '../components/hebrew/HebrewCard';
import { LearningProgress } from '../components/hebrew/LearningProgress';
import { designTokens } from '../theme/tokens';

interface HebrewCard {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gematria?: number;
  rootWord?: string;
  usage?: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

interface LearningSession {
  cards: HebrewCard[];
  currentIndex: number;
  sessionType: 'review' | 'learn' | 'mixed';
  totalCards: number;
}

interface Progress {
  totalCards: number;
  reviewedToday: number;
  dueCards: number;
  newCards: number;
  masteredCards: number;
  currentLevel: number;
  nextReviewTime?: string;
  streakDays: number;
  accuracy: number;
}

export const HebrewLearningScreen: React.FC = () => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentCard, setCurrentCard] = useState<HebrewCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch progress data
      const progressResponse = await fetch('http://localhost:3000/hebrew/progress');
      let progressData: Progress = {
        totalCards: 150,
        reviewedToday: 12,
        dueCards: 8,
        newCards: 5,
        masteredCards: 65,
        currentLevel: 3,
        nextReviewTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        streakDays: 7,
        accuracy: 87
      };

      try {
        progressData = await progressResponse.json();
      } catch (error) {
        console.log('Using mock progress data');
      }

      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      Alert.alert('Error', 'Failed to load learning progress');
    } finally {
      setLoading(false);
    }
  };

  const startLearningSession = async (sessionType: 'review' | 'learn' | 'mixed') => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3000/hebrew/session?type=${sessionType}`);

      // Mock session data
      let sessionData: LearningSession = {
        cards: [
          {
            id: '1',
            hebrew: 'שָׁלוֹם',
            english: 'Peace, Wholeness',
            transliteration: 'Shalom',
            category: 'Common Words',
            difficulty: 'beginner',
            gematria: 376,
            rootWord: 'שלם',
            usage: 'Greeting meaning peace, completeness, or well-being. Root of Jerusalem.',
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
          },
          {
            id: '2',
            hebrew: 'תּוֹרָה',
            english: 'Torah, Teaching',
            transliteration: 'Torah',
            category: 'Religious Terms',
            difficulty: 'beginner',
            gematria: 611,
            rootWord: 'ירה',
            usage: 'The first five books of Scripture containing YHWH\'s teachings and laws.',
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
          },
          {
            id: '3',
            hebrew: 'יְהוָה',
            english: 'YHWH, The Eternal',
            transliteration: 'YHWH',
            category: 'Sacred Names',
            difficulty: 'intermediate',
            gematria: 26,
            usage: 'The sacred name of the Almighty, often replaced with Adonai in reading.',
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
          }
        ],
        currentIndex: 0,
        sessionType,
        totalCards: 3
      };

      try {
        sessionData = await response.json();
      } catch (error) {
        console.log('Using mock session data');
      }

      setSession(sessionData);
      setCurrentCard(sessionData.cards[0]);
      setShowAnswer(false);
      setSessionCompleted(false);
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start learning session');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (cardId: string, quality: number) => {
    if (!session || !currentCard) return;

    try {
      // Submit review to backend
      await fetch('http://localhost:3000/hebrew/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, quality })
      });

      // Move to next card or complete session
      const nextIndex = session.currentIndex + 1;

      if (nextIndex >= session.cards.length) {
        // Session completed
        setSessionCompleted(true);
        setCurrentCard(null);

        // Refresh progress data
        await fetchProgressData();

        Alert.alert(
          'Session Complete! 🎉',
          `Great work! You've completed ${session.cards.length} cards and earned Dominion Coins.`,
          [{ text: 'Continue Learning', onPress: () => setSession(null) }]
        );
      } else {
        // Move to next card
        const updatedSession = {
          ...session,
          currentIndex: nextIndex
        };
        setSession(updatedSession);
        setCurrentCard(session.cards[nextIndex]);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary.indigo} />
          <Typography variant="body" style={styles.loadingText}>
            Loading Hebrew learning...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  // Session View
  if (session && currentCard && !sessionCompleted) {
    return (
      <ScreenContainer>
        {/* Session Header */}
        <AnimatedCard variant="default" delay={0}>
          <View style={styles.sessionHeader}>
            <Typography variant="h2" style={styles.sessionTitle}>
              Hebrew Learning
            </Typography>
            <Typography variant="caption" style={styles.sessionProgress}>
              Card {session.currentIndex + 1} of {session.totalCards} • {session.sessionType}
            </Typography>
          </View>
        </AnimatedCard>

        {/* Current Card */}
        <AnimatedCard variant="hebrew" delay={100}>
          <HebrewCard
            card={currentCard}
            onReview={handleReview}
            showAnswer={showAnswer}
            onToggleAnswer={toggleAnswer}
          />
        </AnimatedCard>

        {/* Session Actions */}
        <AnimatedCard variant="default" delay={200}>
          <View style={styles.sessionActions}>
            <Button
              variant="secondary"
              onPress={() => {
                Alert.alert(
                  'End Session',
                  'Are you sure you want to end this session?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Session', onPress: () => setSession(null) }
                  ]
                );
              }}
            >
              End Session
            </Button>
          </View>
        </AnimatedCard>
      </ScreenContainer>
    );
  }

  // Main Menu View
  return (
    <ScreenContainer>
      {/* Header */}
      <AnimatedCard variant="default" delay={0}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Hebrew Learning
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Master the language of Torah through spaced repetition
          </Typography>
        </View>
      </AnimatedCard>

      {/* Progress Overview */}
      {progress && (
        <AnimatedCard variant="elevated" delay={100}>
          <LearningProgress progress={progress} />
        </AnimatedCard>
      )}

      {/* Learning Options */}
      <AnimatedCard variant="torah" delay={200}>
        <View style={styles.learningOptions}>
          <Typography variant="h3" style={styles.optionsTitle}>
            Start Learning Session
          </Typography>

          <View style={styles.optionButtons}>
            {progress?.dueCards > 0 && (
              <Button
                variant="primary"
                onPress={() => startLearningSession('review')}
                style={styles.optionButton}
              >
                <View style={styles.buttonContent}>
                  <Typography variant="body" style={styles.buttonTitle}>
                    Review Cards
                  </Typography>
                  <Typography variant="caption" style={styles.buttonSubtitle}>
                    {progress.dueCards} cards due
                  </Typography>
                </View>
              </Button>
            )}

            {progress?.newCards > 0 && (
              <Button
                variant="secondary"
                onPress={() => startLearningSession('learn')}
                style={styles.optionButton}
              >
                <View style={styles.buttonContent}>
                  <Typography variant="body" style={styles.buttonTitle}>
                    Learn New Words
                  </Typography>
                  <Typography variant="caption" style={styles.buttonSubtitle}>
                    {progress.newCards} new cards
                  </Typography>
                </View>
              </Button>
            )}

            <Button
              variant="torah"
              onPress={() => startLearningSession('mixed')}
              style={styles.optionButton}
            >
              <View style={styles.buttonContent}>
                <Typography variant="body" style={styles.buttonTitle}>
                  Mixed Practice
                </Typography>
                <Typography variant="caption" style={styles.buttonSubtitle}>
                  Review + new words
                </Typography>
              </View>
            </Button>
          </View>
        </View>
      </AnimatedCard>

      {/* Quick Stats */}
      <AnimatedCard variant="default" delay={300}>
        <View style={styles.quickStats}>
          <Typography variant="h3" style={styles.statsTitle}>
            Today's Goal
          </Typography>
          <Typography variant="body" style={styles.statsText}>
            Study Hebrew for at least 10 minutes to maintain your streak and earn Dominion Coins.
          </Typography>
          {progress && progress.streakDays > 0 && (
            <Typography variant="caption" style={styles.streakReminder}>
              🔥 Keep your {progress.streakDays}-day streak alive!
            </Typography>
          )}
        </View>
      </AnimatedCard>

      {/* Bottom spacing */}
      <View style={{ height: designTokens.spacing.xl }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors.neutral.cream,
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  title: {
    textAlign: 'center',
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
  },
  sessionHeader: {
    alignItems: 'center',
  },
  sessionTitle: {
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.xs,
  },
  sessionProgress: {
    color: designTokens.colors.neutral.gray600,
  },
  sessionActions: {
    alignItems: 'center',
  },
  learningOptions: {
    marginVertical: designTokens.spacing.sm,
  },
  optionsTitle: {
    textAlign: 'center',
    color: designTokens.colors.secondary.goldDark,
    marginBottom: designTokens.spacing.md,
  },
  optionButtons: {
    gap: designTokens.spacing.md,
  },
  optionButton: {
    paddingVertical: designTokens.spacing.lg,
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonTitle: {
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  buttonSubtitle: {
    marginTop: designTokens.spacing.xs,
    opacity: 0.8,
  },
  quickStats: {
    alignItems: 'center',
  },
  statsTitle: {
    color: designTokens.colors.accent.emerald,
    marginBottom: designTokens.spacing.sm,
  },
  statsText: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray700,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
  },
  streakReminder: {
    textAlign: 'center',
    color: designTokens.colors.accent.emerald,
    marginTop: designTokens.spacing.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
});