import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, StatusBar, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';
import { CompactInfluencerRow } from '../components/CompactInfluencerRow';
import { PillFilters } from '../components/PillFilters';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/designSystem';
import { Animated } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const TRUST_FILTERS = [
  { id: 'all', label: 'Tous', value: undefined },
  { id: '80', label: '80%+', value: 80 },
  { id: '60', label: '60%+', value: 60 },
  { id: '40', label: '40%+', value: 40 },
];

export const CompactRankingScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrustFilter, setSelectedTrustFilter] = useState('all');
  
  const currentTrustFilter = TRUST_FILTERS.find(f => f.id === selectedTrustFilter)?.value;
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', currentTrustFilter, searchQuery],
    queryFn: () => influencerApi.getAll({
      minTrustScore: currentTrustFilter,
      limit: 1000,
      search: searchQuery || undefined,
    }),
  });
  
  const handleInfluencerPress = (influencer: Influencer) => {
    navigation.navigate('Detail', { influencerId: influencer.id });
  };
  
  const handleTrustFilterSelect = (id: string) => {
    setSelectedTrustFilter(id);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <Animated.Text style={styles.title}>
          CLASSEMENT
        </Animated.Text>
        {influencers && (
          <Animated.Text style={styles.count}>
            {influencers.length}
          </Animated.Text>
        )}
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={COLORS.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      {/* Filters */}
      <PillFilters
        options={TRUST_FILTERS}
        selectedId={selectedTrustFilter}
        onSelect={handleTrustFilterSelect}
      />
      
      {/* Compact List */}
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CompactInfluencerRow
            influencer={item}
            onPress={() => handleInfluencerPress(item)}
            index={index}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={COLORS.black}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Animated.Text style={styles.emptyText}>
              Aucun résultat
            </Animated.Text>
          </View>
        }
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 64, // Row height
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
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.black,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },
  count: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray500,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  emptyContainer: {
    padding: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray500,
  },
});
