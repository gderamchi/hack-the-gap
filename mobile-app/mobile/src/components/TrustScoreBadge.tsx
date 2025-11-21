import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, getTrustScoreColor, getTrustScoreLabel, GRADIENTS } from '../constants/designSystem';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'medium',
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      rotateAnim.setValue(1);
    }
  }, [score]);
  
  const trustColor = getTrustScoreColor(score);
  const trustLabel = getTrustScoreLabel(score);
  
  const getGradient = (): string[] => {
    if (score >= 80) return GRADIENTS.trustExcellent;
    if (score >= 60) return GRADIENTS.trustGood;
    if (score >= 40) return GRADIENTS.trustNeutral;
    return GRADIENTS.trustPoor;
  };
  
  const dimensions = {
    small: { size: 60, fontSize: TYPOGRAPHY.fontSize.lg },
    medium: { size: 100, fontSize: TYPOGRAPHY.fontSize['3xl'] },
    large: { size: 140, fontSize: TYPOGRAPHY.fontSize['5xl'] },
  }[size];
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          {
            width: dimensions.size,
            height: dimensions.size,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              transform: [{ rotate }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.scoreText,
              {
                fontSize: dimensions.fontSize,
              },
            ]}
          >
            {Math.round(score)}
          </Animated.Text>
          <Animated.Text style={styles.percentText}>%</Animated.Text>
        </Animated.View>
      </LinearGradient>
      
      <View style={styles.labelContainer}>
        <Animated.Text style={styles.label}>{trustLabel}</Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  innerCircle: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    width: '85%',
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.black,
    lineHeight: TYPOGRAPHY.fontSize['5xl'],
  },
  percentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray600,
    position: 'absolute',
    bottom: '25%',
    right: '20%',
  },
  labelContainer: {
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    color: COLORS.gray600,
  },
});
