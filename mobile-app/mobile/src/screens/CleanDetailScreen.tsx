import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { influencerApi } from '../services/api';
import { BeautifulRating } from '../components/BeautifulRating';
import { useLocalRatings } from '../hooks/useLocalRatings';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

export const CleanDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  const { getRating } = useLocalRatings();
  
  const { data: influencer, isLoading, refetch } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });
  
  const userRating = getRating(influencerId);
  
  if (isLoading || !influencer) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }
  
  const trustColor = getTrustColor(influencer.trustScore);
  const socialHandles = typeof influencer.socialHandles === 'string' 
    ? JSON.parse(influencer.socialHandles) 
    : influencer.socialHandles || {};
  
  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile */}
        <View style={styles.profile}>
          {influencer.imageUrl && (
            <Image source={{ uri: influencer.imageUrl }} style={styles.profileImage} />
          )}
          <Text style={styles.profileName}>{influencer.name}</Text>
          <Text style={styles.profileNiche}>{influencer.niche}</Text>
          {socialHandles.platform && (
            <Text style={styles.profilePlatform}>
              {socialHandles.platform} • {socialHandles.followers}
            </Text>
          )}
        </View>
        
        {/* Trust Score */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreBadge, { backgroundColor: trustColor }]}>
            <Text style={styles.scoreValue}>{Math.round(influencer.trustScore)}</Text>
          </View>
          <Text style={styles.scoreLabel}>Trust Score</Text>
        </View>
        
        {/* Summary */}
        {influencer.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{influencer.summary}</Text>
          </View>
        )}
        
        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{influencer.dramaCount}</Text>
              <Text style={styles.statLabel}>Dramas</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{influencer.goodActionCount}</Text>
              <Text style={styles.statLabel}>Positive</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{influencer.neutralCount}</Text>
              <Text style={styles.statLabel}>Neutral</Text>
            </View>
          </View>
        </View>
        
        {/* Rating Component */}
        <BeautifulRating
          influencerId={influencer.id}
          influencerName={influencer.name}
          onRatingChanged={() => refetch()}
        />
        
        {/* Mentions */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Mentions ({influencer.mentions.length})</Text>
            {influencer.mentions.slice(0, 10).map((mention: any) => (
              <View key={mention.id} style={styles.mention}>
                <Text style={styles.mentionText}>{mention.textExcerpt}</Text>
                <Text style={styles.mentionSource}>{mention.source}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#666',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  back: {
    fontSize: 17,
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  profileNiche: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  profilePlatform: {
    fontSize: 14,
    color: '#999',
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  mention: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mentionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  mentionSource: {
    fontSize: 12,
    color: '#999',
  },
});
