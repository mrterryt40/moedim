import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Card } from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  variant?: 'default' | 'torah' | 'hebrew' | 'feast' | 'elevated';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  variant = 'default',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card variant={variant}>
        {children}
      </Card>
    </Animated.View>
  );
};