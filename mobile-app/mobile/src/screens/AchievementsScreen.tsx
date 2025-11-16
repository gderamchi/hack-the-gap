import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { engagementApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export const AchievementsScreen: React.FC = () => {
  const { isAuthenticated } = useSupabaseAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await engagementApi.getMyAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Login to see your achievements!</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {unlockedAchievements.length} / {achievements.length} unlocked
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
            {unlockedAchievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.unlockedCard]}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.iconText}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={styles.achievementLevel}>
                      {getLevelBadge(achievement.achievementLevel)}
                    </Text>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🔒 Locked</Text>
            {lockedAchievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.lockedCard]}>
                <View style={[styles.achievementIcon, styles.lockedIcon]}>
                  <Text style={styles.iconText}>🔒</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, styles.lockedText]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, styles.lockedText]}>
                    {achievement.description}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${(achievement.progress / achievement.progressTarget) * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress} / {achievement.progressTarget}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {achievements.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No achievements yet. Start rating influencers!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getLevelBadge = (level: number): string => {
  switch (level) {
    case 1: return '🥉 Bronze';
    case 2: return '🥈 Silver';
    case 3: return '🥇 Gold';
    case 4: return '💎 Platinum';
    default: return `Level ${level}`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unlockedCard: {
    backgroundColor: '#fff',
  },
  lockedCard: {
    backgroundColor: '#f3f4f6',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lockedIcon: {
    backgroundColor: '#d1d5db',
  },
  iconText: {
    fontSize: 30,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  lockedText: {
    opacity: 0.6,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  achievementDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 50,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
