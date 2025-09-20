import React from 'react';
import { View } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Typography, Button, Card } from '../components/ui';
import { TorahCard } from '../components/torah/TorahCard';
import { StreakCounter } from '../components/progress/StreakCounter';
import { HebrewDateDisplay } from '../components/calendar/HebrewDateDisplay';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { designTokens } from '../theme/tokens';

export const DesignSystemDemo: React.FC = () => {
  const mockPortion = {
    nameEnglish: "In the Beginning",
    nameHebrew: "בְּרֵאשִׁית",
    content: {
      english: "In the beginning, Elohim created the heavens and the earth. The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of Elohim was moving over the surface of the waters.",
      hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל פְּנֵי הַמָּיִם",
      transliteration: "B'reishit bara Elohim et hashamayim v'et ha'aretz...",
      commentary: "The opening verse of Torah establishes Elohim as the Creator of all things, setting the foundation for our understanding of His sovereignty over creation."
    }
  };

  return (
    <ScreenContainer>
      {/* Typography Showcase */}
      <Card variant="default" style={{ marginBottom: designTokens.spacing.md }}>
        <Typography variant="h1">Mo'edim Design System</Typography>
        <Typography variant="h2">Beautiful Israelite UI</Typography>
        <Typography variant="h3">Component Library</Typography>
        <Typography variant="body">This is body text for reading content.</Typography>
        <Typography variant="caption">Caption text for labels and metadata.</Typography>
        <Typography variant="hebrew">עברית קדושה</Typography>
        <Typography variant="verse">"For I am YHWH your Elohim"</Typography>
      </Card>

      {/* Button Variants */}
      <Card variant="default" style={{ marginBottom: designTokens.spacing.md }}>
        <Typography variant="h3" style={{ marginBottom: designTokens.spacing.md }}>
          Button Variants
        </Typography>
        <View style={{ gap: designTokens.spacing.sm }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="torah">Torah Action</Button>
          <Button variant="success">Success State</Button>
          <Button variant="ghost">Ghost Button</Button>
        </View>
      </Card>

      {/* Card Variants */}
      <View style={{ gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
        <Card variant="default">
          <Typography variant="h3">Default Card</Typography>
          <Typography variant="body">Standard card with subtle shadow</Typography>
        </Card>

        <Card variant="torah">
          <Typography variant="h3">Torah Card</Typography>
          <Typography variant="body">Special styling for Torah content</Typography>
        </Card>

        <Card variant="hebrew">
          <Typography variant="h3">Hebrew Card</Typography>
          <Typography variant="body">Card with Hebrew gold accent</Typography>
        </Card>

        <Card variant="feast">
          <Typography variant="h3">Feast Card</Typography>
          <Typography variant="body">Special occasions and appointments</Typography>
        </Card>

        <Card variant="elevated">
          <Typography variant="h3">Elevated Card</Typography>
          <Typography variant="body">High elevation for important content</Typography>
        </Card>
      </View>

      {/* Hebrew Date Display */}
      <AnimatedCard variant="feast" delay={0}>
        <HebrewDateDisplay
          hebrewDate="כ״ג אלול תשפ״ה"
          gregorianDate="September 20, 2024"
          isShabbat={true}
          nextFeast={{
            name: "Rosh Hashanah",
            daysUntil: 8
          }}
        />
      </AnimatedCard>

      {/* Streak Counter */}
      <AnimatedCard variant="elevated" delay={100}>
        <StreakCounter
          streakDays={21}
          totalCoins={350}
          totalReadings={45}
        />
      </AnimatedCard>

      {/* Torah Card */}
      <AnimatedCard variant="torah" delay={200}>
        <TorahCard
          portion={mockPortion}
          onComplete={() => console.log('Torah completed!')}
          isCompleted={false}
          coinReward={10}
        />
      </AnimatedCard>

      {/* Color Palette Display */}
      <Card variant="default" style={{ marginBottom: designTokens.spacing.xl }}>
        <Typography variant="h3" style={{ marginBottom: designTokens.spacing.md }}>
          Mo'edim Color Palette
        </Typography>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: designTokens.spacing.sm }}>
          {[
            { name: 'Indigo', color: designTokens.colors.primary.indigo },
            { name: 'Gold', color: designTokens.colors.secondary.gold },
            { name: 'Crimson', color: designTokens.colors.accent.crimson },
            { name: 'Emerald', color: designTokens.colors.accent.emerald },
            { name: 'Cream', color: designTokens.colors.neutral.cream },
          ].map((colorInfo) => (
            <View key={colorInfo.name} style={{ alignItems: 'center', marginBottom: designTokens.spacing.sm }}>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: colorInfo.color,
                borderRadius: designTokens.borderRadius.md,
                marginBottom: designTokens.spacing.xs,
                ...designTokens.shadows.sm
              }} />
              <Typography variant="caption">{colorInfo.name}</Typography>
            </View>
          ))}
        </View>
      </Card>
    </ScreenContainer>
  );
};