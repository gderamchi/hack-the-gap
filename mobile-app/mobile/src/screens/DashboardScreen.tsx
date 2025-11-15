import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, StatusBar, TextInput, TouchableOpacity, Image, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#ef4444';
  return '#dc2626';
};

const SORT_OPTIONS = [
  { id: 'best', label: 'Best', icon: '🏆', sortBy: 'trustScore', order: 'desc' },
  { id: 'worst', label: 'Worst', icon: '⚠️', sortBy: 'trustScore', order: 'asc' },
  { id: 'drama', label: 'Most Drama', icon: '🔥', sortBy: 'dramaCount', order: 'desc' },
  { id: 'positive', label: 'Most Positive', icon: '✨', sortBy: 'goodActionCount', order: 'desc' },
  { id: 'recent', label: 'Recent', icon: '🆕', sortBy: 'lastUpdated', order: 'desc' },
];

const TRUST_FILTERS = [
  { id: 'all', label: 'All', value: undefined },
  { id: '80', label: '80%+', value: 80 },
  { id: '60', label: '60%+', value: 60 },
  { id: '40', label: '40%+', value: 40 },
  { id: '20', label: '20%+', value: 20 },
];

const CompactRow = ({ influencer, onPress, index, sortMode }: any) => {
  const trustColor = getTrustColor(influencer.trustScore);
  const medal = influencer.rank === 1 ? '🥇' : influencer.rank === 2 ? '🥈' : influencer.rank === 3 ? '🥉' : null;
  
  // Highlight based on sort mode
  const getHighlight = () => {
    if (sortMode === 'drama' && influencer.dramaCount > 5) return '#fef2f2';
    if (sortMode === 'positive' && influencer.goodActionCount > 10) return '#f0fdf4';
    if (sortMode === 'worst' && influencer.trustScore < 40) return '#fef2f2';
    return '#fff';
  };
  
  return (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: getHighlight() }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text style={styles.rank}>{medal || `#${index + 1}`}</Text>
      
      <Image
        source={{ uri: influencer.imageUrl }}
        style={styles.image}
      />
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{influencer.name}</Text>
        <View style={styles.meta}>
          {influencer.niche && <Text style={styles.niche}>{influencer.niche}</Text>}
          <Text style={styles.separator}>•</Text>
          <Text style={styles.stats}>{influencer.dramaCount}D {influencer.goodActionCount}P</Text>
        </View>
      </View>
      
      <View style={[styles.scoreBadge, { backgroundColor: trustColor }]}>
        <Text style={styles.scoreText}>{Math.round(influencer.trustScore)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useSimpleAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('best');
  
  const currentFilter = TRUST_FILTERS.find(f => f.id === selectedFilter)?.value;
  const currentSort = SORT_OPTIONS.find(s => s.id === selectedSort);
  
  const { data: allInfluencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', currentFilter, searchQuery],
    queryFn: () => influencerApi.getAll({
      minTrustScore: currentFilter,
      limit: 1000,
      search: searchQuery || undefined,
    }),
  });
  
  // Client-side sorting for advanced options
  const influencers = React.useMemo(() => {
    if (!allInfluencers) return [];
    
    const sorted = [...allInfluencers].sort((a, b) => {
      const field = currentSort?.sortBy || 'trustScore';
      const order = currentSort?.order || 'desc';
      
      let aVal = a[field as keyof Influencer] as number;
      let bVal = b[field as keyof Influencer] as number;
      
      if (field === 'lastUpdated') {
        aVal = new Date(a.lastUpdated).getTime();
        bVal = new Date(b.lastUpdated).getTime();
      }
      
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    return sorted;
  }, [allInfluencers, currentSort]);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RANKINGS</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {influencers && <Text style={styles.count}>{influencers.length}</Text>}
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={{ fontSize: 24 }}>{isAuthenticated ? '👤' : '○'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search influencers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>VIEW:</Text>
        <View style={styles.sortButtons}>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.sortButton, selectedSort === option.id && styles.sortButtonActive]}
              onPress={() => setSelectedSort(option.id)}
            >
              <Text style={styles.sortIcon}>{option.icon}</Text>
              <Text style={[styles.sortText, selectedSort === option.id && styles.sortTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Trust Filters */}
      <View style={styles.filters}>
        {TRUST_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filter, selectedFilter === filter.id && styles.filterActive]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* List */}
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CompactRow
            influencer={item}
            onPress={() => navigation.navigate('Detail', { influencerId: item.id })}
            index={index}
            sortMode={selectedSort}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 64,
          offset: 64 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: '#000',
  },
  sortIcon: {
    fontSize: 14,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  sortTextActive: {
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  filterActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    height: 64,
  },
  rank: {
    width: 40,
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textAlign: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  niche: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  separator: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  stats: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
  },
});
