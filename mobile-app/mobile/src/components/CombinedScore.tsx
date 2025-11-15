import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { supabase } from '../lib/supabase';

interface CombinedScoreProps {
  influencerId: string;
  aiScore: number;
}

export const CombinedScore: React.FC<CombinedScoreProps> = ({ influencerId, aiScore }) => {
  const [communityScore, setCommunityScore] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchCommunityScore();
  }, [influencerId]);

  const fetchCommunityScore = async () => {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('rating')
        .eq('influencer_id', influencerId);

      if (error) throw error;

      if (data && data.length > 0) {
        const ratings = data.map(r => r.rating);
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const communityScore = (avg / 5) * 100; // Convert 1-5 to 0-100
        
        setAvgRating(avg);
        setRatingCount(ratings.length);
        setCommunityScore(communityScore);
      }
    } catch (error) {
      console.error('Error fetching community score:', error);
    }
  };

  // Combined score: 60% AI + 40% Community
  const combinedScore = communityScore !== null
    ? Math.round((aiScore * 0.6) + (communityScore * 0.4))
    : aiScore;

  const getTrustColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      {/* Combined Score */}
      <View style={styles.mainScore}>
        <View style={[styles.scoreBadge, { backgroundColor: getTrustColor(combinedScore) }]}>
          <Text style={styles.scoreValue}>{combinedScore}</Text>
          <Text style={styles.scorePercent}>%</Text>
        </View>
        <Text style={styles.scoreLabel}>SCORE GLOBAL</Text>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>IA</Text>
          <Text style={styles.breakdownValue}>{Math.round(aiScore)}%</Text>
          <Text style={styles.breakdownWeight}>60%</Text>
        </View>
        
        {communityScore !== null && (
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Communauté</Text>
            <Text style={styles.breakdownValue}>{Math.round(communityScore)}%</Text>
            <Text style={styles.breakdownWeight}>40%</Text>
            <Text style={styles.breakdownInfo}>
              ⭐ {avgRating.toFixed(1)} ({ratingCount} avis)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  scorePercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    position: 'absolute',
    bottom: 25,
    right: 22,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 2,
  },
  breakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 2,
  },
  breakdownWeight: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  breakdownInfo: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 4,
  },
});
