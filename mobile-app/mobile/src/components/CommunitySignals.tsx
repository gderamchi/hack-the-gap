import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { communityApi } from '../services/api';

interface CommunitySignalsProps {
  influencerId: string;
  refreshTrigger?: number;
}

export const CommunitySignals: React.FC<CommunitySignalsProps> = ({
  influencerId,
  refreshTrigger,
}) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [influencerId, refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [signalsData, statsData] = await Promise.all([
        communityApi.getSignals(influencerId, { limit: 10 }),
        communityApi.getStats(influencerId),
      ]);
      setSignals(signalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Community Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.title}>Community Insights</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRatings}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalDramaReports}</Text>
            <Text style={styles.statLabel}>Drama Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPositiveReports}</Text>
            <Text style={styles.statLabel}>Positive Reports</Text>
          </View>
        </View>

        {/* Rating Distribution */}
        {stats.totalRatings > 0 && (
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionTitle}>Rating Distribution</Text>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0;
              const percentage = stats.totalRatings > 0 
                ? (count / stats.totalRatings) * 100 
                : 0;
              
              return (
                <View key={star} style={styles.distributionRow}>
                  <Text style={styles.distributionStar}>{star}★</Text>
                  <View style={styles.distributionBar}>
                    <View 
                      style={[
                        styles.distributionFill, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Community Score */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Community Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(stats.communityScore) }]}>
              {Math.round(stats.communityScore)}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Combined Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(stats.combinedScore) }]}>
              {Math.round(stats.combinedScore)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Signals */}
      {signals.length > 0 && (
        <View style={styles.signalsCard}>
          <Text style={styles.title}>Recent Community Feedback</Text>
          
          {signals.slice(0, 5).map((signal) => (
            <View key={signal.id} style={styles.signalItem}>
              <View style={styles.signalHeader}>
                <Text style={styles.signalType}>
                  {signal.type === 'RATING' && '⭐ Rating'}
                  {signal.type === 'DRAMA_REPORT' && '🚨 Drama Report'}
                  {signal.type === 'POSITIVE_ACTION' && '✨ Positive Action'}
                  {signal.type === 'COMMENT' && '💬 Comment'}
                </Text>
                <Text style={styles.signalDate}>
                  {new Date(signal.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              {signal.rating && (
                <Text style={styles.signalRating}>
                  {'★'.repeat(signal.rating)}{'☆'.repeat(5 - signal.rating)}
                </Text>
              )}
              
              {signal.comment && (
                <Text style={styles.signalComment} numberOfLines={3}>
                  {signal.comment}
                </Text>
              )}
              
              {signal.user && (
                <Text style={styles.signalUser}>
                  by {signal.user.firstName || 'Anonymous'}
                  {signal.user.role === 'PROFESSIONAL' && ' 🔹'}
                  {signal.user.role === 'ADMIN' && ' ⭐'}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  signalsCard: {
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  distributionContainer: {
    marginBottom: 20,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionStar: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
    width: 30,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
  },
  distributionCount: {
    fontSize: 12,
    color: '#6b7280',
    width: 30,
    textAlign: 'right',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  signalItem: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  signalDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  signalRating: {
    fontSize: 18,
    color: '#fbbf24',
    marginBottom: 8,
  },
  signalComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  signalUser: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
