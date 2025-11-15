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
  return '#ef4444';
};

const SimpleRow = ({ influencer, onPress, index }: any) => {
  const trustColor = getTrustColor(influencer.trustScore);
  const rank = index + 1;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rank}>{medal || `#${rank}`}</Text>
      
      <Image
        source={{ uri: influencer.imageUrl }}
        style={styles.image}
      />
      
      <View style={styles.info}>
        <Text style={styles.name}>{influencer.name}</Text>
        <Text style={styles.niche}>{influencer.niche}</Text>
      </View>
      
      <View style={[styles.score, { backgroundColor: trustColor }]}>
        <Text style={styles.scoreText}>{Math.round(influencer.trustScore)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const CleanSimpleScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useSimpleAuth();
  const [search, setSearch] = useState('');
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', search],
    queryFn: () => influencerApi.getAll({
      limit: 1000,
      search: search || undefined,
    }),
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rankings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>{isAuthenticated ? '👤' : '○'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Simple Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      
      {/* Simple List */}
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SimpleRow
            influencer={item}
            onPress={() => navigation.navigate('Detail', { influencerId: item.id })}
            index={index}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  profileIcon: {
    fontSize: 28,
  },
  searchBox: {
    padding: 15,
  },
  search: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rank: {
    width: 45,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  niche: {
    fontSize: 14,
    color: '#666',
  },
  score: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
