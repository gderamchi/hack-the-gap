import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Appbar, Searchbar, FAB, Chip, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';
import { InfluencerCard } from '../components/InfluencerCard';
import { DisclaimerModal } from '../components/DisclaimerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const DISCLAIMER_KEY = 'disclaimer_accepted';

export const RankingScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minTrustScore, setMinTrustScore] = useState<number | undefined>();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', minTrustScore, searchQuery],
    queryFn: () => influencerApi.getAll({ 
      minTrustScore, 
      limit: 100,
      search: searchQuery || undefined 
    }),
  });
  
  useEffect(() => {
    checkDisclaimer();
  }, []);
  
  const checkDisclaimer = async () => {
    const accepted = await AsyncStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) {
      setShowDisclaimer(true);
    }
  };
  
  const handleAcceptDisclaimer = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setShowDisclaimer(false);
  };
  
  const handleInfluencerPress = (influencer: Influencer) => {
    navigation.navigate('Detail', { influencerId: influencer.id });
  };
  
  const handleSearchPress = () => {
    navigation.navigate('Search');
  };
  
  const clearFilter = () => {
    setMinTrustScore(undefined);
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Classement Influenceurs" />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un influenceur..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      {influencers && influencers.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Total
            </Text>
            <Text variant="titleLarge" style={styles.summaryValue}>
              {influencers.length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Score moyen
            </Text>
            <Text variant="titleLarge" style={styles.summaryValue}>
              {Math.round(influencers.reduce((sum, inf) => sum + inf.trustScore, 0) / influencers.length)}%
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.filterContainer}>
        <Text variant="bodySmall" style={styles.filterLabel}>
          Score minimum:
        </Text>
        <View style={styles.chips}>
          <Chip
            selected={minTrustScore === 80}
            onPress={() => setMinTrustScore(80)}
            style={styles.chip}
          >
            80%+
          </Chip>
          <Chip
            selected={minTrustScore === 60}
            onPress={() => setMinTrustScore(60)}
            style={styles.chip}
          >
            60%+
          </Chip>
          <Chip
            selected={minTrustScore === 40}
            onPress={() => setMinTrustScore(40)}
            style={styles.chip}
          >
            40%+
          </Chip>
          {minTrustScore && (
            <Chip
              onPress={clearFilter}
              style={styles.chip}
              icon="close"
            >
              Effacer
            </Chip>
          )}
        </View>
      </View>
      
      {influencers && influencers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Aucun influenceur trouvé
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Utilisez le bouton + pour rechercher un influenceur
          </Text>
        </View>
      )}
      
      <FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InfluencerCard
            influencer={item}
            onPress={() => handleInfluencerPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.list}
      />
      
      <FAB
        icon="magnify"
        style={styles.fab}
        onPress={handleSearchPress}
        label="Rechercher"
      />
      
      <DisclaimerModal
        visible={showDisclaimer}
        onDismiss={handleAcceptDisclaimer}
      />
      
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          ℹ️ Informations basées sur sources publiques
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
  },
  footer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  summaryLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
});
