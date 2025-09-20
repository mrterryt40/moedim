import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { FeastCard } from '../components/calendar/FeastCard';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { HebrewDateDisplay } from '../components/calendar/HebrewDateDisplay';
import { designTokens } from '../theme/tokens';

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

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isShabbat: boolean;
  isFeast: boolean;
  feastName?: string;
  hebrewDate?: string;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'feast' | 'sabbath' | 'reading' | 'community';
  color: string;
}

interface CalendarData {
  currentYear: number;
  currentMonth: number;
  hebrewYear: number;
  hebrewMonth: string;
  days: CalendarDay[];
  upcomingFeasts: Feast[];
  todaysEvents: CalendarEvent[];
}

export const CalendarScreen: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'feasts'>('month');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      const response = await fetch(`http://localhost:3000/calendar/month?year=${year}&month=${month + 1}`);

      // Mock calendar data
      let mockData: CalendarData = {
        currentYear: year,
        currentMonth: month,
        hebrewYear: 5785,
        hebrewMonth: 'Tishri',
        days: generateMockCalendarDays(year, month),
        upcomingFeasts: [
          {
            id: '1',
            name: 'Rosh HaShanah',
            hebrewName: 'ראש השנה',
            category: 'major',
            startDate: new Date(2024, 8, 16).toISOString(), // Sept 16, 2024
            endDate: new Date(2024, 8, 17).toISOString(),
            daysUntil: 15,
            duration: 2,
            description: 'The Israelite New Year, a time of reflection, repentance, and renewal of our covenant with YHWH.',
            significance: 'Marks the beginning of the High Holy Days and the new year according to the Hebrew calendar.',
            observances: ['Shofar blowing', 'Special prayers', 'Festive meals', 'Tashlich ceremony'],
            scripturalReferences: ['Leviticus 23:24-25', 'Numbers 29:1-6'],
            isUpcoming: true
          },
          {
            id: '2',
            name: 'Yom Kippur',
            hebrewName: 'יום כפור',
            category: 'major',
            startDate: new Date(2024, 8, 25).toISOString(), // Sept 25, 2024
            endDate: new Date(2024, 8, 25).toISOString(),
            daysUntil: 24,
            duration: 1,
            description: 'The Day of Atonement, the holiest day in the Israelite calendar devoted to fasting, prayer, and repentance.',
            significance: 'A day of complete fasting and spiritual purification, seeking forgiveness from YHWH.',
            observances: ['25-hour fast', 'Intensive prayer', 'Teshuvah (repentance)', 'Charity giving'],
            scripturalReferences: ['Leviticus 16:29-31', 'Leviticus 23:27-32'],
            isUpcoming: true
          },
          {
            id: '3',
            name: 'Sukkot',
            hebrewName: 'סוכות',
            category: 'major',
            startDate: new Date(2024, 8, 30).toISOString(), // Sept 30, 2024
            endDate: new Date(2024, 9, 6).toISOString(), // Oct 6, 2024
            daysUntil: 29,
            duration: 7,
            description: 'The Feast of Tabernacles, celebrating the harvest and remembering our ancestors\' journey in the wilderness.',
            significance: 'Commemorates the 40 years the Israelites spent in the wilderness and celebrates the autumn harvest.',
            observances: ['Living in sukkah', 'Four species ritual', 'Water drawing ceremony', 'Hospitality'],
            scripturalReferences: ['Leviticus 23:34-42', 'Deuteronomy 16:13-15'],
            isUpcoming: true
          },
          {
            id: '4',
            name: 'Sabbath',
            hebrewName: 'שבת',
            category: 'sabbath',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            daysUntil: 2,
            duration: 1,
            description: 'The weekly Sabbath, a day of rest and spiritual renewal as commanded by YHWH.',
            significance: 'Weekly observance of rest, worship, and family time, honoring the Creator and creation.',
            observances: ['Candle lighting', 'Kiddush', 'Special meals', 'Torah study', 'Rest from work'],
            scripturalReferences: ['Exodus 20:8-11', 'Deuteronomy 5:12-15'],
            isUpcoming: true
          }
        ],
        todaysEvents: [
          {
            id: '1',
            title: 'Torah Study Group',
            type: 'community',
            color: designTokens.colors.primary.indigo
          },
          {
            id: '2',
            title: 'Parashat Vayeira',
            type: 'reading',
            color: designTokens.colors.accent.crimson
          }
        ]
      };

      try {
        const data = await response.json();
        mockData = { ...mockData, ...data };
      } catch (error) {
        console.log('Using mock calendar data');
      }

      setCalendarData(mockData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCalendarDays = (year: number, month: number): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) { // 6 weeks
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      const isShabbat = currentDate.getDay() === 6; // Saturday
      const isFeast = isCurrentMonth && (currentDate.getDate() === 16 || currentDate.getDate() === 25 || currentDate.getDate() === 30);

      const events: CalendarEvent[] = [];

      if (isShabbat) {
        events.push({
          id: `sabbath-${i}`,
          title: 'Sabbath',
          type: 'sabbath',
          color: designTokens.colors.accent.emerald
        });
      }

      if (isFeast) {
        events.push({
          id: `feast-${i}`,
          title: 'Feast Day',
          type: 'feast',
          color: designTokens.colors.secondary.gold
        });
      }

      if (isCurrentMonth && currentDate.getDay() === 3) { // Wednesday
        events.push({
          id: `study-${i}`,
          title: 'Torah Study',
          type: 'community',
          color: designTokens.colors.primary.indigo
        });
      }

      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isShabbat,
        isFeast,
        feastName: isFeast ? (currentDate.getDate() === 16 ? 'Rosh HaShanah' : currentDate.getDate() === 25 ? 'Yom Kippur' : 'Sukkot') : undefined,
        hebrewDate: isCurrentMonth ? `${currentDate.getDate()}` : undefined,
        events
      });
    }

    return days;
  };

  const handleDatePress = (date: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(date);
    setSelectedDate(newDate);

    // Show events for selected date
    const dayData = calendarData?.days.find(day => day.date === date && day.isCurrentMonth);
    if (dayData && dayData.events.length > 0) {
      Alert.alert(
        `Events for ${newDate.toLocaleDateString()}`,
        dayData.events.map(event => `• ${event.title}`).join('\n'),
        [{ text: 'OK' }]
      );
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleFeastPress = (feast: Feast) => {
    Alert.alert(
      feast.name,
      `${feast.description}\n\nSignificance: ${feast.significance}\n\nObservances:\n${feast.observances.map(obs => `• ${obs}`).join('\n')}\n\nScriptural References: ${feast.scripturalReferences.join(', ')}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary.indigo} />
          <Typography variant="body" style={styles.loadingText}>
            Loading calendar...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  if (!calendarData) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.centerContainer}>
          <Typography variant="h2" style={styles.errorTitle}>
            Calendar Unavailable
          </Typography>
          <Typography variant="body" style={styles.errorText}>
            Unable to load calendar data. Please try again.
          </Typography>
          <Button variant="primary" onPress={fetchCalendarData}>
            Retry
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <AnimatedCard variant="default" delay={0}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Israelite Calendar
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Biblical feasts and appointed times
          </Typography>
        </View>
      </AnimatedCard>

      {/* Current Hebrew Date */}
      <AnimatedCard variant="feast" delay={100}>
        <HebrewDateDisplay
          hebrewDate={`${calendarData.hebrewMonth} ${calendarData.hebrewYear}`}
          gregorianDate={new Date().toLocaleDateString()}
          isShabbat={new Date().getDay() === 6}
          nextFeast={calendarData.upcomingFeasts[0] ? {
            name: calendarData.upcomingFeasts[0].name,
            daysUntil: calendarData.upcomingFeasts[0].daysUntil
          } : undefined}
        />
      </AnimatedCard>

      {/* View Mode Toggle */}
      <AnimatedCard variant="default" delay={200}>
        <View style={styles.viewModeToggle}>
          <Button
            variant={viewMode === 'month' ? 'primary' : 'secondary'}
            onPress={() => setViewMode('month')}
            style={styles.toggleButton}
          >
            Month View
          </Button>
          <Button
            variant={viewMode === 'feasts' ? 'primary' : 'secondary'}
            onPress={() => setViewMode('feasts')}
            style={styles.toggleButton}
          >
            Feasts & Events
          </Button>
        </View>
      </AnimatedCard>

      {/* Month View */}
      {viewMode === 'month' && (
        <AnimatedCard variant="default" delay={300}>
          <CalendarMonthView
            year={calendarData.currentYear}
            month={calendarData.currentMonth}
            hebrewYear={calendarData.hebrewYear}
            hebrewMonth={calendarData.hebrewMonth}
            days={calendarData.days}
            onDatePress={handleDatePress}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </AnimatedCard>
      )}

      {/* Feasts View */}
      {viewMode === 'feasts' && (
        <ScrollView style={styles.feastsContainer}>
          <AnimatedCard variant="torah" delay={300}>
            <View style={styles.feastsHeader}>
              <Typography variant="h2" style={styles.feastsTitle}>
                Upcoming Appointed Times
              </Typography>
              <Typography variant="body" style={styles.feastsSubtitle}>
                Biblical feasts and holy days as commanded in Torah
              </Typography>
            </View>
          </AnimatedCard>

          {calendarData.upcomingFeasts.map((feast, index) => (
            <AnimatedCard key={feast.id} variant="default" delay={400 + index * 100}>
              <FeastCard
                feast={feast}
                onPress={handleFeastPress}
              />
            </AnimatedCard>
          ))}
        </ScrollView>
      )}

      {/* Today's Events */}
      {calendarData.todaysEvents.length > 0 && (
        <AnimatedCard variant="elevated" delay={500}>
          <View style={styles.todaysEvents}>
            <Typography variant="h3" style={styles.eventsTitle}>
              Today's Events
            </Typography>
            {calendarData.todaysEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={[styles.eventIndicator, { backgroundColor: event.color }]} />
                <Typography variant="body" style={styles.eventTitle}>
                  {event.title}
                </Typography>
              </View>
            ))}
          </View>
        </AnimatedCard>
      )}

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
    paddingHorizontal: designTokens.spacing.lg,
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
  },
  errorTitle: {
    textAlign: 'center',
    color: designTokens.colors.accent.crimson,
    marginBottom: designTokens.spacing.md,
  },
  errorText: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
    marginBottom: designTokens.spacing.lg,
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
  viewModeToggle: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },
  toggleButton: {
    flex: 1,
  },
  feastsContainer: {
    flex: 1,
  },
  feastsHeader: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  feastsTitle: {
    textAlign: 'center',
    color: designTokens.colors.secondary.goldDark,
    marginBottom: designTokens.spacing.xs,
  },
  feastsSubtitle: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray600,
  },
  todaysEvents: {
    marginTop: designTokens.spacing.md,
  },
  eventsTitle: {
    color: designTokens.colors.accent.emerald,
    marginBottom: designTokens.spacing.md,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  eventIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: designTokens.spacing.sm,
  },
  eventTitle: {
    flex: 1,
    color: designTokens.colors.neutral.gray700,
  },
});