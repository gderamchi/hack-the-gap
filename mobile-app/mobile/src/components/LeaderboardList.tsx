import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface LeaderboardListProps {
  data: any[];
  type: 'influencer' | 'user';
  emptyMessage?: string;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  data,
  type,
  emptyMessage = 'No data available',
}) => {
  const navigation = useNavigation();

  const handlePress = (item: any) => {
    if (type === 'influencer') {
      (navigation as any).navigate('Detail', { influencerId: item.id });
    }
  };

  const renderInfluencerItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      {/* Rank Badge */}
      <View style={styles.rankContainer}>
        {item.badge ? (
          <Text style={styles.rankBadge}>{item.badge}</Text>
        ) : (
          <Text style={styles.rankNumber}>#{item.rank}</Text>
        )}
      </View>

      {/* Profile Image */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
      />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.niche} numberOfLines={1}>{item.niche || 'General'}</Text>
        
        {/* Additional Info */}
        {item.scoreChange !== undefined && (
          <Text style={[
            styles.change,
            { color: item.scoreChange >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {item.scoreChange >= 0 ? '+' : ''}{item.scoreChange.toFixed(1)} pts
            {item.scoreChangePercent !== undefined && 
              ` (${item.scoreChangePercent >= 0 ? '+' : ''}${item.scoreChangePercent.toFixed(1)}%)`
            }
          </Text>
        )}
        
        {item.trendType && (
          <Text style={styles.trendType}>
            {getTrendLabel(item.trendType)}
          </Text>
        )}
        
        {item.reason && (
          <Text style={styles.reason} numberOfLines={1}>{item.reason}</Text>
        )}
      </View>

      {/* Score Badge */}
      <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.trustScore || item.currentScore) }]}>
        <Text style={styles.scoreText}>{Math.round(item.trustScore || item.currentScore || 0)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      {/* Rank Badge */}
      <View style={styles.rankContainer}>
        {item.badge ? (
          <Text style={styles.rankBadge}>{item.badge}</Text>
        ) : (
          <Text style={styles.rankNumber}>#{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || 'Anonymous'}
          {item.role === 'PROFESSIONAL' && ' 🔹'}
          {item.role === 'ADMIN' && ' ⭐'}
          {item.subscriptionTier === 'PREMIUM' && ' 💎'}
          {item.subscriptionTier === 'PROFESSIONAL' && ' 👑'}
        </Text>
        <Text style={styles.niche}>
          {item.totalReports !== undefined ? (
            `${item.totalReports} reports (🚨${item.dramaReports} ✨${item.positiveReports})`
          ) : (
            `Level ${item.level} • ${item.experiencePoints || item.activityCount} ${item.experiencePoints ? 'XP' : 'activities'}`
          )}
        </Text>
        {item.reputationScore && (
          <Text style={styles.reputation}>
            Reputation: {item.reputationScore.toFixed(1)}
          </Text>
        )}
      </View>

      {/* Level Badge */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{item.level || 1}</Text>
      </View>
    </View>
  );

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => `${item.id || item.userId}-${index}`}
      renderItem={type === 'influencer' ? renderInfluencerItem : renderUserItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getTrendLabel = (trendType: string): string => {
  switch (trendType) {
    case 'RISING': return '📈 Rising';
    case 'FALLING': return '📉 Falling';
    case 'CONTROVERSIAL': return '🔥 Controversial';
    case 'IMPROVING': return '✨ Improving';
    default: return trendType;
  }
};

const styles = StyleSheet.create({
  list: {
    padding: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadge: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  niche: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  trendType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 2,
  },
  reason: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  reputation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
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
