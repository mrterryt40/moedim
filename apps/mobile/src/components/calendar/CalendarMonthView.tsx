import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

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

interface CalendarMonthViewProps {
  year: number;
  month: number;
  hebrewYear: number;
  hebrewMonth: string;
  days: CalendarDay[];
  onDatePress: (date: number) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  year,
  month,
  hebrewYear,
  hebrewMonth,
  days,
  onDatePress,
  onPreviousMonth,
  onNextMonth,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayStyle = (day: CalendarDay) => {
    const baseStyle = [styles.dayContainer];

    if (!day.isCurrentMonth) {
      baseStyle.push(styles.otherMonthDay);
    }

    if (day.isToday) {
      baseStyle.push(styles.todayDay);
    }

    if (day.isShabbat) {
      baseStyle.push(styles.sabbathDay);
    }

    if (day.isFeast) {
      baseStyle.push(styles.feastDay);
    }

    return baseStyle;
  };

  const getDayTextStyle = (day: CalendarDay) => {
    const baseStyle = [styles.dayText];

    if (!day.isCurrentMonth) {
      baseStyle.push(styles.otherMonthText);
    }

    if (day.isToday) {
      baseStyle.push(styles.todayText);
    }

    if (day.isShabbat) {
      baseStyle.push(styles.sabbathText);
    }

    if (day.isFeast) {
      baseStyle.push(styles.feastText);
    }

    return baseStyle;
  };

  // Split days into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Card variant="default" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="secondary"
          size="small"
          onPress={onPreviousMonth}
          style={styles.navButton}
        >
          ‹
        </Button>

        <View style={styles.monthInfo}>
          <Typography variant="h2" style={styles.gregorianMonth}>
            {monthNames[month]} {year}
          </Typography>
          <Typography variant="hebrew" style={styles.hebrewMonth}>
            {hebrewMonth} {hebrewYear}
          </Typography>
        </View>

        <Button
          variant="secondary"
          size="small"
          onPress={onNextMonth}
          style={styles.navButton}
        >
          ›
        </Button>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName, index) => (
          <View key={dayName} style={styles.dayNameContainer}>
            <Typography
              variant="caption"
              style={[
                styles.dayName,
                index === 6 && styles.sabbathDayName // Saturday
              ]}
            >
              {dayName}
            </Typography>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <Pressable
                key={`${weekIndex}-${dayIndex}`}
                style={getDayStyle(day)}
                onPress={() => day.isCurrentMonth && onDatePress(day.date)}
              >
                <Typography style={getDayTextStyle(day)}>
                  {day.date}
                </Typography>

                {/* Hebrew Date */}
                {day.hebrewDate && day.isCurrentMonth && (
                  <Typography variant="caption" style={styles.hebrewDay}>
                    {day.hebrewDate}
                  </Typography>
                )}

                {/* Event Indicators */}
                {day.events.length > 0 && day.isCurrentMonth && (
                  <View style={styles.eventIndicators}>
                    {day.events.slice(0, 3).map((event, eventIndex) => (
                      <View
                        key={event.id}
                        style={[
                          styles.eventDot,
                          { backgroundColor: event.color }
                        ]}
                      />
                    ))}
                    {day.events.length > 3 && (
                      <Typography variant="caption" style={styles.moreEvents}>
                        +{day.events.length - 3}
                      </Typography>
                    )}
                  </View>
                )}

                {/* Feast Name */}
                {day.feastName && day.isCurrentMonth && (
                  <Typography variant="caption" style={styles.feastName}>
                    {day.feastName}
                  </Typography>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: designTokens.colors.accent.emerald }]} />
          <Typography variant="caption" style={styles.legendText}>Sabbath</Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: designTokens.colors.secondary.gold }]} />
          <Typography variant="caption" style={styles.legendText}>Feast</Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: designTokens.colors.primary.indigo }]} />
          <Typography variant="caption" style={styles.legendText}>Community</Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: designTokens.colors.accent.crimson }]} />
          <Typography variant="caption" style={styles.legendText}>Torah Reading</Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.md,
  },
  navButton: {
    minWidth: 40,
    height: 40,
  },
  monthInfo: {
    alignItems: 'center',
    flex: 1,
  },
  gregorianMonth: {
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.xs,
  },
  hebrewMonth: {
    color: designTokens.colors.secondary.gold,
    fontSize: designTokens.typography.fontSize.base,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: designTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.neutral.gray200,
    paddingBottom: designTokens.spacing.sm,
  },
  dayNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    color: designTokens.colors.neutral.gray600,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  sabbathDayName: {
    color: designTokens.colors.accent.emerald,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  calendarGrid: {
    marginBottom: designTokens.spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.gray100,
    backgroundColor: designTokens.colors.neutral.white,
    padding: designTokens.spacing.xs,
    position: 'relative',
  },
  otherMonthDay: {
    backgroundColor: designTokens.colors.neutral.gray50,
  },
  todayDay: {
    backgroundColor: designTokens.colors.primary.indigoLight,
    borderColor: designTokens.colors.primary.indigo,
    borderWidth: 2,
  },
  sabbathDay: {
    backgroundColor: designTokens.colors.accent.emeraldLight,
  },
  feastDay: {
    backgroundColor: designTokens.colors.secondary.goldLight,
  },
  dayText: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.neutral.gray800,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  otherMonthText: {
    color: designTokens.colors.neutral.gray400,
  },
  todayText: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  sabbathText: {
    color: designTokens.colors.accent.emerald,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  feastText: {
    color: designTokens.colors.secondary.goldDark,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  hebrewDay: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.neutral.gray500,
    marginTop: 1,
  },
  eventIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 1,
  },
  moreEvents: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.neutral.gray500,
    marginLeft: 1,
  },
  feastName: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.secondary.goldDark,
    textAlign: 'center',
    marginTop: 1,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.neutral.gray200,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: designTokens.spacing.xs,
  },
  legendText: {
    color: designTokens.colors.neutral.gray600,
  },
});