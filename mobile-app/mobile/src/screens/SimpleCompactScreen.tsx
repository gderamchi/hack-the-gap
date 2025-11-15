import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, StatusBar, TextInput, TouchableOpacity, Image, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#ef4444';
  return '#dc2626';
};

const CompactRow = ({ influencer, onPress, index }: any) => {
  const trustColor = getTrustColor(influencer.trustScore);
  const medal = influencer.rank === 1 ? '🥇' : influencer.rank === 2 ? '🥈' : influencer.rank === 3 ? '🥉' : null;
  
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rank}>{medal || `#${influencer.rank || index + 1}`}</Text>
      
      <Image
        source={{ uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=96&background=random&bold=true` }}
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

export const SimpleCompactScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState<number | undefined>();
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', minScore, searchQuery],
    queryFn: () => influencerApi.getAll({
      minTrustScore: minScore,
      limit: 1000,
      search: searchQuery || undefined,
    }),
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>CLASSEMENT</Text>
        {influencers && <Text style={styles.count}>{influencers.length}</Text>}
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filter, minScore === undefined && styles.filterActive]}
          onPress={() => setMinScore(undefined)}
        >
          <Text style={[styles.filterText, minScore === undefined && styles.filterTextActive]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, minScore === 80 && styles.filterActive]}
          onPress={() => setMinScore(80)}
        >
          <Text style={[styles.filterText, minScore === 80 && styles.filterTextActive]}>80%+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, minScore === 60 && styles.filterActive]}
          onPress={() => setMinScore(60)}
        >
          <Text style={[styles.filterText, minScore === 60 && styles.filterTextActive]}>60%+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, minScore === 40 && styles.filterActive]}
          onPress={() => setMinScore(40)}
        >
          <Text style={[styles.filterText, minScore === 40 && styles.filterTextActive]}>40%+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CompactRow
            influencer={item}
            onPress={() => navigation.navigate('Detail', { influencerId: item.id })}
            index={index}
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  filterActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterText: {
    fontSize: 13,
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
});
