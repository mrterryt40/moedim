import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';

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

export const DailyTorahScreen: React.FC = () => {
  const [portion, setPortion] = useState<TorahPortion | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'english' | 'hebrew' | 'both'>('both');

  useEffect(() => {
    fetchDailyPortion();
  }, []);

  const fetchDailyPortion = async () => {
    try {
      setLoading(true);

      // In production, this would call your API: http://localhost:3000/torah/daily
      // For now, using sample data
      const response = await fetch('http://localhost:3000/torah/daily');
      const data = await response.json();

      setPortion(data);
    } catch (error) {
      console.error('Error fetching Torah portion:', error);
      Alert.alert('Error', 'Failed to load daily Torah portion');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = () => {
    Alert.alert(
      'Baruch HaShem!',
      'You have completed today\'s Torah reading. May you be blessed with understanding and wisdom.',
      [{ text: 'Amen', style: 'default' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading Torah portion...</Text>
      </View>
    );
  }

  if (!portion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No Torah portion available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDailyPortion}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Torah</Text>
        <Text style={styles.date}>
          {portion.gregorianDate} • {portion.hebrewDate}
        </Text>
        {portion.isSabbath && (
          <View style={styles.sabbathBadge}>
            <Text style={styles.sabbathText}>Shabbat Shalom</Text>
          </View>
        )}
      </View>

      {/* Language Toggle */}
      <View style={styles.languageToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, language === 'english' && styles.activeToggle]}
          onPress={() => setLanguage('english')}
        >
          <Text style={styles.toggleText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, language === 'hebrew' && styles.activeToggle]}
          onPress={() => setLanguage('hebrew')}
        >
          <Text style={styles.toggleText}>עברית</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, language === 'both' && styles.activeToggle]}
          onPress={() => setLanguage('both')}
        >
          <Text style={styles.toggleText}>Both</Text>
        </TouchableOpacity>
      </View>

      {/* Torah Portion Content */}
      <View style={styles.contentCard}>
        <View style={styles.portionHeader}>
          <Text style={styles.portionName}>{portion.nameEnglish}</Text>
          <Text style={styles.portionNameHebrew}>{portion.nameHebrew}</Text>
          <Text style={styles.verses}>{portion.content.verses}</Text>
        </View>

        <Text style={styles.theme}>Theme: {portion.content.theme}</Text>

        {/* English Content */}
        {(language === 'english' || language === 'both') && (
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>English</Text>
            <Text style={styles.contentText}>{portion.content.english}</Text>
          </View>
        )}

        {/* Hebrew Content */}
        {(language === 'hebrew' || language === 'both') && (
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>Hebrew</Text>
            <Text style={[styles.contentText, styles.hebrewText]}>
              {portion.content.hebrew}
            </Text>
          </View>
        )}

        {/* Lessons */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Key Lessons</Text>
          {portion.content.lessons.map((lesson, index) => (
            <View key={index} style={styles.lessonItem}>
              <Text style={styles.lessonBullet}>•</Text>
              <Text style={styles.lessonText}>{lesson}</Text>
            </View>
          ))}
        </View>

        {/* Next Reading */}
        {portion.nextReading && (
          <View style={styles.nextReading}>
            <Text style={styles.sectionTitle}>Next Reading</Text>
            <Text style={styles.nextReadingText}>
              {portion.nextReading.nameEnglish} • {portion.nextReading.nameHebrew}
            </Text>
          </View>
        )}
      </View>

      {/* Complete Reading Button */}
      <TouchableOpacity style={styles.completeButton} onPress={markAsRead}>
        <Text style={styles.completeButtonText}>Mark as Read</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976D2',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  sabbathBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  sabbathText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#1976D2',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contentCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  portionHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  portionName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  portionNameHebrew: {
    fontSize: 20,
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'right',
  },
  verses: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  theme: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  hebrewText: {
    textAlign: 'right',
    fontSize: 18,
  },
  lessonsSection: {
    marginBottom: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  lessonBullet: {
    fontSize: 16,
    color: '#1976D2',
    marginRight: 8,
    marginTop: 2,
  },
  lessonText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  nextReading: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextReadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  completeButton: {
    backgroundColor: '#2E7D32',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});