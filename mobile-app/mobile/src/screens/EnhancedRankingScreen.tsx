import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TextInput, TouchableOpacity, Image, Text, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useLocalRatings } from '../hooks/useLocalRatings';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const InfluencerRow = React.memo(({ influencer, onPress, index, userRating }: any) => {
  const trustColor = getTrustColor(influencer.trustScore);
  const rank = index + 1;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{medal || `#${rank}`}</Text>
      </View>
      
      <Image
        source={{ uri: influencer.imageUrl }}
        style={styles.image}
      />
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{influencer.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.niche} numberOfLines={1}>{influencer.niche || 'General'}</Text>
          {userRating && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.userRating}>You: ★{userRating.rating}</Text>
            </>
          )}
        </View>
      </View>
      
      <View style={[styles.scoreBadge, { backgroundColor: trustColor }]}>
        <Text style={styles.scoreText}>{Math.round(influencer.trustScore)}</Text>
      </View>
    </TouchableOpacity>
  );
});

export const EnhancedRankingScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, user } = useSupabaseAuth();
  const { getRating, getAllRatings } = useLocalRatings();
  const [search, setSearch] = useState('');
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', search],
    queryFn: () => influencerApi.getAll({
      limit: 1000,
      search: search || undefined,
    }),
  });

  const myRatingsCount = getAllRatings().length;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rankings</Text>
          {influencers && (
            <Text style={styles.subtitle}>{influencers.length} influencers</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.leaderboardButton}
            onPress={() => navigation.navigate('Leaderboard' as any)}
          >
            <Text style={styles.leaderboardIcon}>🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {isAuthenticated ? (
              <View style={styles.profileBadge}>
                <Text style={styles.profileInitial}>
                  {user?.user_metadata?.firstName?.[0] || user?.email?.[0] || '?'}
                </Text>
              </View>
            ) : (
              <View style={styles.profileBadgeEmpty}>
                <Text style={styles.profileIcon}>👤</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search influencers..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* My Ratings Banner */}
      {myRatingsCount > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⭐ You've rated {myRatingsCount} influencer{myRatingsCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      {/* List */}
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <InfluencerRow
            influencer={item}
            onPress={() => navigation.navigate('Detail', { influencerId: item.id })}
            index={index}
            userRating={getRating(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch}
            tintColor="#000"
          />
        }
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 76,
          offset: 76 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No influencers found</Text>
            <Text style={styles.emptySubtext}>Try a different search</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  leaderboardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardIcon: {
    fontSize: 20,
  },
  profileButton: {
    // No extra styles needed
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  profileBadgeEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  clearIcon: {
    fontSize: 18,
    color: '#9ca3af',
    padding: 5,
  },
  banner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rankContainer: {
    width: 45,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  niche: {
    fontSize: 14,
    color: '#6b7280',
  },
  dot: {
    fontSize: 14,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  userRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fbbf24',
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scoreText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6b7280',
  },
});
