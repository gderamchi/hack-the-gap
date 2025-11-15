import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Influencer } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, getTrustScoreColor, getTrustScoreLabel } from '../constants/designSystem';

interface Props {
  influencer: Influencer;
  onPress: () => void;
  index?: number;
}

export const InfluencerCardRedesigned: React.FC<Props> = ({ influencer, onPress, index = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };
  
  const trustColor = getTrustScoreColor(influencer.trustScore);
  const trustLabel = getTrustScoreLabel(influencer.trustScore);
  
  // Medal for top 3
  const getMedal = () => {
    if (influencer.rank === 1) return '🥇';
    if (influencer.rank === 2) return '🥈';
    if (influencer.rank === 3) return '🥉';
    return null;
  };
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Image with gradient overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=400&background=000&color=fff&bold=true` }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
            style={styles.gradient}
          />
          
          {/* Content overlay */}
          <View style={styles.content}>
            {/* Rank badge */}
            {influencer.rank && influencer.rank <= 10 && (
              <View style={styles.rankBadge}>
                <Animated.Text style={styles.rankText}>
                  {getMedal() || `#${influencer.rank}`}
                </Animated.Text>
              </View>
            )}
            
            {/* Name */}
            <Animated.Text style={styles.name} numberOfLines={1}>
              {influencer.name.toUpperCase()}
            </Animated.Text>
            
            {/* Niche */}
            {influencer.niche && (
              <Animated.Text style={styles.niche}>
                {influencer.niche}
              </Animated.Text>
            )}
            
            {/* Trust score */}
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreBadge, { backgroundColor: trustColor }]}>
                <Animated.Text style={styles.scoreText}>
                  {Math.round(influencer.trustScore)}%
                </Animated.Text>
              </View>
              <Animated.Text style={styles.trustLabel}>
                {trustLabel}
              </Animated.Text>
            </View>
            
            {/* Quick stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Animated.Text style={styles.statValue}>
                  {influencer.dramaCount}
                </Animated.Text>
                <Animated.Text style={styles.statLabel}>Dramas</Animated.Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Animated.Text style={styles.statValue}>
                  {influencer.goodActionCount}
                </Animated.Text>
                <Animated.Text style={styles.statLabel}>Positifs</Animated.Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray200,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  rankBadge: {
    position: 'absolute',
    top: -SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  rankText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.black,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  niche: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray300,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
  },
  trustLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginRight: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray400,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.gray600,
    marginHorizontal: SPACING.md,
  },
});
