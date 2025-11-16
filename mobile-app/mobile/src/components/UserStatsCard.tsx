import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { engagementApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface UserStatsCardProps {
  onViewAchievements?: () => void;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ onViewAchievements }) => {
  const { isAuthenticated } = useSupabaseAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getMyStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginPrompt}>Login to see your stats and achievements!</Text>
      </View>
    );
  }

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
      {/* Level Badge */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelNumber}>{stats.level}</Text>
        <Text style={styles.levelLabel}>Level</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.experiencePoints}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRatings}</Text>
          <Text style={styles.statLabel}>Ratings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>🔥 Streak</Text>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Level {stats.level} → {stats.level + 1}
          </Text>
          <Text style={styles.progressText}>
            {stats.progressToNextLevel} / {stats.xpNeededForNextLevel} XP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(stats.progressPercent, 100)}%` }
            ]} 
          />
        </View>
      </View>

      {/* View Achievements Button */}
      <TouchableOpacity 
        style={styles.achievementsButton}
        onPress={onViewAchievements || (() => (navigation as any).navigate('Achievements'))}
        activeOpacity={0.7}
      >
        <Text style={styles.achievementsButtonText}>🏆 View Achievements</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  levelBadge: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  achievementsButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});
