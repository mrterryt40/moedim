import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { TorahCard } from '../components/torah/TorahCard';
import { StreakCounter } from '../components/progress/StreakCounter';
import { HebrewDateDisplay } from '../components/calendar/HebrewDateDisplay';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { designTokens } from '../theme/tokens';

interface TorahPortion {
  id: string;
  nameEnglish: string;
  nameHebrew: string;
  parasha: string;
  content: {
    english: string;
    hebrew: string;
    verses: string;
    theme: string;
    lessons: string[];
    transliteration?: string;
    commentary?: string;
  };
  hebrewDate: string;
  gregorianDate: string;
  isSabbath: boolean;
  nextReading?: {
    nameEnglish: string;
    nameHebrew: string;
    startDate: string;
  };
}

interface UserProgress {
  streakDays: number;
  totalCoins: number;
  totalReadings: number;
  isCompletedToday: boolean;
}

export const DailyTorahScreen: React.FC = () => {
  const [portion, setPortion] = useState<TorahPortion | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    streakDays: 0,
    totalCoins: 0,
    totalReadings: 0,
    isCompletedToday: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyData();
  }, []);

  const fetchDailyData = async () => {
    try {
      setLoading(true);

      // Fetch Torah portion and user progress in parallel
      const [portionResponse, progressResponse] = await Promise.all([
        fetch('/torah/daily'),
        fetch('/users/progress') // This would need authentication
      ]);

      const portionData = await portionResponse.json();
      let progressData = { streakDays: 7, totalCoins: 150, totalReadings: 25, isCompletedToday: false };

      try {
        progressData = await progressResponse.json();
      } catch (error) {
        console.log('Using mock progress data');
      }

      // Add commentary and transliteration for enhanced experience
      portionData.content.commentary = `This portion teaches us about the covenant relationship between YHWH and the Israelites. The Hebrew word for covenant, "brit" (ברית), appears throughout this passage, emphasizing the eternal nature of our commitment to follow Torah.`;
      portionData.content.transliteration = `Va-yomer Adonai el-Moshe: "Katov l'cha et-ha-d'varim ha-eleh..."`;

      setPortion(portionData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error fetching daily data:', error);
      Alert.alert('Error', 'Failed to load daily Torah content');
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    try {
      // Call API to mark as complete and award coins
      const response = await fetch('/torah/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portionId: portion?.id })
      });

      if (response.ok) {
        const result = await response.json();

        setUserProgress(prev => ({
          ...prev,
          isCompletedToday: true,
          totalCoins: prev.totalCoins + 10,
          totalReadings: prev.totalReadings + 1,
          streakDays: prev.streakDays + 1
        }));

        Alert.alert(
          'Baruch HaShem! 🙌',
          `You have completed today's Torah reading and earned 10 Dominion Coins! Your streak is now ${userProgress.streakDays + 1} days.`,
          [{ text: 'Amen', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error completing reading:', error);
      Alert.alert('Error', 'Failed to mark reading as complete');
    }
  };

  const getNextFeast = () => {
    // This would come from the calendar service
    return {
      name: "Sukkot",
      daysUntil: 45
    };
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: designTokens.colors.neutral.cream
        }}>
          <ActivityIndicator size="large" color={designTokens.colors.primary.indigo} />
          <Typography variant="body" style={{ marginTop: designTokens.spacing.md }}>
            Loading today's Torah portion...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  if (!portion) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: designTokens.spacing.lg
        }}>
          <Typography variant="h2" style={{
            textAlign: 'center',
            marginBottom: designTokens.spacing.md,
            color: designTokens.colors.accent.crimson
          }}>
            No Torah Portion Available
          </Typography>
          <Typography variant="body" style={{
            textAlign: 'center',
            marginBottom: designTokens.spacing.xl
          }}>
            We couldn't load today's reading. Please check your connection and try again.
          </Typography>
          <Button variant="primary" onPress={fetchDailyData}>
            Retry Loading
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Hebrew Date and Calendar */}
      <AnimatedCard variant="default" delay={0}>
        <HebrewDateDisplay
          hebrewDate={portion.hebrewDate}
          gregorianDate={portion.gregorianDate}
          isShabbat={portion.isSabbath}
          nextFeast={getNextFeast()}
        />
      </AnimatedCard>

      {/* User Progress and Streak */}
      <AnimatedCard variant="elevated" delay={100}>
        <StreakCounter
          streakDays={userProgress.streakDays}
          totalCoins={userProgress.totalCoins}
          totalReadings={userProgress.totalReadings}
        />
      </AnimatedCard>

      {/* Daily Torah Portion */}
      <AnimatedCard variant="torah" delay={200}>
        <View style={{ alignItems: 'center', marginBottom: designTokens.spacing.lg }}>
          <Typography variant="h1" style={{
            textAlign: 'center',
            color: designTokens.colors.primary.indigo,
            marginBottom: designTokens.spacing.xs
          }}>
            Daily Torah
          </Typography>
          <Typography variant="caption" style={{
            textAlign: 'center',
            color: designTokens.colors.neutral.gray500
          }}>
            Parashat {portion.parasha} • {portion.content.verses}
          </Typography>
        </View>

        <TorahCard
          portion={{
            nameEnglish: portion.nameEnglish,
            nameHebrew: portion.nameHebrew,
            content: {
              english: portion.content.english,
              hebrew: portion.content.hebrew,
              transliteration: portion.content.transliteration,
              commentary: portion.content.commentary
            }
          }}
          onComplete={markAsComplete}
          isCompleted={userProgress.isCompletedToday}
          coinReward={10}
        />
      </AnimatedCard>

      {/* Theme and Lessons */}
      <AnimatedCard variant="hebrew" delay={300}>
        <View style={{ marginBottom: designTokens.spacing.md }}>
          <Typography variant="h3" style={{
            marginBottom: designTokens.spacing.sm,
            color: designTokens.colors.secondary.goldDark
          }}>
            Today's Theme
          </Typography>
          <Typography variant="verse" style={{
            textAlign: 'center',
            marginBottom: designTokens.spacing.lg
          }}>
            "{portion.content.theme}"
          </Typography>
        </View>

        <View>
          <Typography variant="h3" style={{
            marginBottom: designTokens.spacing.sm,
            color: designTokens.colors.accent.emerald
          }}>
            Key Lessons for Israelites
          </Typography>
          {portion.content.lessons.map((lesson, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              marginBottom: designTokens.spacing.sm,
              alignItems: 'flex-start'
            }}>
              <Typography variant="body" style={{
                color: designTokens.colors.secondary.gold,
                marginRight: designTokens.spacing.sm,
                marginTop: 2
              }}>
                •
              </Typography>
              <Typography variant="body" style={{
                flex: 1,
                lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base
              }}>
                {lesson}
              </Typography>
            </View>
          ))}
        </View>
      </AnimatedCard>

      {/* Next Reading Preview */}
      {portion.nextReading && (
        <AnimatedCard variant="default" delay={400}>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="h3" style={{
              marginBottom: designTokens.spacing.sm,
              color: designTokens.colors.primary.indigo
            }}>
              Next Week's Reading
            </Typography>
            <Typography variant="body" style={{
              textAlign: 'center',
              color: designTokens.colors.neutral.gray600
            }}>
              {portion.nextReading.nameEnglish}
            </Typography>
            <Typography variant="hebrew" style={{
              textAlign: 'center',
              fontSize: designTokens.typography.fontSize.lg,
              marginTop: designTokens.spacing.xs
            }}>
              {portion.nextReading.nameHebrew}
            </Typography>
          </View>
        </AnimatedCard>
      )}

      {/* Bottom spacing for scroll */}
      <View style={{ height: designTokens.spacing.xl }} />
    </ScreenContainer>
  );
};