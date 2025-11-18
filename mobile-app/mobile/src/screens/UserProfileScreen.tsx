import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { engagementApi } from '../services/api';

export const UserProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: string };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserActivity();
  }, [userId]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementApi.getUserActivity(userId);
      setUserData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user activity');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'REJECTED':
        return '❌';
      default:
        return '•';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DRAMA_REPORT':
        return '🚨';
      case 'POSITIVE_ACTION':
        return '✨';
      case 'RATING':
        return '⭐';
      case 'COMMENT':
        return '💬';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'User not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserActivity}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user, stats, recentActivities, influencerBreakdown } = userData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.name[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>
            {user.role === 'ADMIN' && '⭐ Admin'}
            {user.role === 'PROFESSIONAL' && '🔹 Professional'}
            {user.role === 'COMMUNITY' && '👤 Community Member'}
          </Text>
          <Text style={styles.memberSince}>
            Member since {formatDate(user.memberSince)}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.experiencePoints}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.reputationScore.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Reputation</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Activity Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>
        <View style={styles.activityStats}>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Total Activities</Text>
            <Text style={styles.activityValue}>{stats.totalActivities}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>🚨 Drama Reports</Text>
            <Text style={styles.activityValue}>{stats.dramaReports}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>✨ Positive Reports</Text>
            <Text style={styles.activityValue}>{stats.positiveReports}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>⭐ Ratings</Text>
            <Text style={styles.activityValue}>{stats.ratings}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: '#10b981' }]}>✅ Verified</Text>
            <Text style={[styles.activityValue, { color: '#10b981' }]}>{stats.verifiedReports}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: '#f59e0b' }]}>⏳ Pending</Text>
            <Text style={[styles.activityValue, { color: '#f59e0b' }]}>{stats.pendingReports}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: '#ef4444' }]}>❌ Rejected</Text>
            <Text style={[styles.activityValue, { color: '#ef4444' }]}>{stats.rejectedReports}</Text>
          </View>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {recentActivities.length === 0 ? (
          <Text style={styles.emptyText}>No activities yet</Text>
        ) : (
          recentActivities.map((activity: any) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => {
                (navigation as any).navigate('Detail', {
                  influencerId: activity.influencer.id,
                });
              }}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityType}>
                  <Text style={styles.typeIcon}>{getTypeIcon(activity.type)}</Text>
                  <Text style={styles.typeName}>
                    {activity.type === 'DRAMA_REPORT' && 'Drama Report'}
                    {activity.type === 'POSITIVE_ACTION' && 'Positive Action'}
                    {activity.type === 'RATING' && 'Rating'}
                    {activity.type === 'COMMENT' && 'Comment'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(activity.status)} {activity.status}
                  </Text>
                </View>
              </View>

              <View style={styles.influencerInfo}>
                <Image
                  source={{ uri: activity.influencer.imageUrl }}
                  style={styles.influencerImage}
                />
                <View style={styles.influencerDetails}>
                  <Text style={styles.influencerName}>{activity.influencer.name}</Text>
                  <Text style={styles.influencerNiche}>{activity.influencer.niche}</Text>
                </View>
              </View>

              {activity.comment && (
                <Text style={styles.activityComment} numberOfLines={2}>
                  "{activity.comment}"
                </Text>
              )}

              {activity.rating && (
                <Text style={styles.activityRating}>
                  {'⭐'.repeat(activity.rating)} ({activity.rating}/5)
                </Text>
              )}

              <Text style={styles.activityDate}>{formatDate(activity.createdAt)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Influencer Breakdown */}
      {influencerBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity by Influencer</Text>
          {influencerBreakdown.map((item: any) => (
            <TouchableOpacity
              key={item.influencer.id}
              style={styles.influencerCard}
              onPress={() => {
                (navigation as any).navigate('Detail', {
                  influencerId: item.influencer.id,
                });
              }}
            >
              <Image
                source={{ uri: item.influencer.imageUrl }}
                style={styles.influencerCardImage}
              />
              <View style={styles.influencerCardInfo}>
                <Text style={styles.influencerCardName}>{item.influencer.name}</Text>
                <Text style={styles.influencerCardNiche}>{item.influencer.niche}</Text>
                <Text style={styles.influencerCardCount}>
                  {item.activities.length} {item.activities.length === 1 ? 'activity' : 'activities'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  activityStats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  influencerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  influencerDetails: {
    flex: 1,
  },
  influencerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  influencerNiche: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityComment: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  activityRating: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  influencerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  influencerCardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  influencerCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  influencerCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  influencerCardNiche: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  influencerCardCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
