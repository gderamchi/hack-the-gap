import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Text, Card, ProgressBar, Button, SegmentedButtons, ActivityIndicator, Banner } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Mention } from '../types';
import { influencerApi } from '../services/api';
import { MentionCard } from '../components/MentionCard';
import { getTrustColor } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: influencer, isLoading } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });
  
  const refreshMutation = useMutation({
    mutationFn: () => influencerApi.refresh(influencerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', influencerId] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
  
  if (isLoading || !influencer) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chargement..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }
  
  const trustColor = getTrustColor(influencer.trustScore);
  
  const filteredMentions = influencer.mentions.filter((mention: Mention) => {
    if (filter === 'all') return true;
    return mention.label === filter;
  });
  
  const dramaCount = influencer.mentions.filter((m: Mention) => m.label === 'drama').length;
  const goodCount = influencer.mentions.filter((m: Mention) => m.label === 'good_action').length;
  const neutralCount = influencer.mentions.filter((m: Mention) => m.label === 'neutral').length;
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={influencer.name} />
        <Appbar.Action
          icon="refresh"
          onPress={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
        />
      </Appbar.Header>
      
      <ScrollView>
        <Banner
          visible={true}
          icon="information"
          style={styles.banner}
        >
          ⚠️ Score indicatif - Vérifiez toujours les sources
        </Banner>
        
        <Card style={styles.scoreCard}>
          <Card.Content>
            <View style={styles.scoreHeader}>
              <View>
                <Text variant="headlineLarge" style={[styles.score, { color: trustColor }]}>
                  {Math.round(influencer.trustScore)}%
                </Text>
                <Text variant="titleMedium" style={styles.trustLevel}>
                  {influencer.trustLevel}
                </Text>
              </View>
              {influencer.niche && (
                <Text variant="bodyLarge" style={styles.niche}>
                  {influencer.niche}
                </Text>
              )}
            </View>
            
            <ProgressBar
              progress={influencer.trustScore / 100}
              color={trustColor}
              style={styles.progressBar}
            />
            
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {dramaCount}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Dramas
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {goodCount}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Actions positives
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {neutralCount}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Neutres
                </Text>
              </View>
            </View>
            
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Dernière mise à jour: {new Date(influencer.lastUpdated).toLocaleDateString('fr-FR')}
            </Text>
          </Card.Content>
        </Card>
        
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            buttons={[
              { value: 'all', label: `Tous (${influencer.mentions.length})` },
              { value: 'drama', label: `Dramas (${dramaCount})` },
              { value: 'good_action', label: `Positifs (${goodCount})` },
            ]}
          />
        </View>
        
        <View style={styles.mentionsContainer}>
          <Text variant="titleMedium" style={styles.mentionsTitle}>
            Mentions ({filteredMentions.length})
          </Text>
          
          {filteredMentions.length === 0 && (
            <Text variant="bodyMedium" style={styles.noMentions}>
              Aucune mention dans cette catégorie
            </Text>
          )}
          
          {filteredMentions.map((mention: Mention) => (
            <MentionCard key={mention.id} mention={mention} />
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            💡 Cliquez sur l'icône pour ouvrir la source originale
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    marginBottom: 8,
  },
  scoreCard: {
    margin: 16,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    fontWeight: 'bold',
  },
  trustLevel: {
    opacity: 0.7,
  },
  niche: {
    opacity: 0.7,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  lastUpdated: {
    textAlign: 'center',
    opacity: 0.7,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mentionsContainer: {
    paddingBottom: 24,
  },
  mentionsTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  noMentions: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 32,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
