import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Influencer } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, getTrustScoreColor } from '../constants/designSystem';

interface Props {
  influencer: Influencer;
  onPress: () => void;
  index: number;
}

export const CompactInfluencerRow: React.FC<Props> = ({ influencer, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };
  
  const trustColor = getTrustScoreColor(influencer.trustScore);
  
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
          styles.row,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Animated.Text style={styles.rank}>
            {getMedal() || `#${influencer.rank || index + 1}`}
          </Animated.Text>
        </View>
        
        {/* Profile Image */}
        <Image
          source={{ 
            uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=80&background=random&bold=true`
          }}
          style={styles.image}
        />
        
        {/* Info */}
        <View style={styles.info}>
          <Animated.Text style={styles.name} numberOfLines={1}>
            {influencer.name}
          </Animated.Text>
          <View style={styles.meta}>
            {influencer.niche && (
              <Animated.Text style={styles.niche} numberOfLines={1}>
                {influencer.niche}
              </Animated.Text>
            )}
            <Animated.Text style={styles.separator}>•</Animated.Text>
            <Animated.Text style={styles.stats}>
              {influencer.dramaCount}D {influencer.goodActionCount}P
            </Animated.Text>
          </View>
        </View>
        
        {/* Trust Score */}
        <View style={[styles.scoreBadge, { backgroundColor: trustColor }]}>
          <Animated.Text style={styles.scoreText}>
            {Math.round(influencer.trustScore)}
          </Animated.Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rank: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray600,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  niche: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray600,
    marginRight: SPACING.xs,
  },
  separator: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray400,
    marginHorizontal: SPACING.xs,
  },
  stats: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray500,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
  },
});
