import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, StatusBar, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Mention } from '../types';
import { influencerApi } from '../services/api';
import { CombinedScore } from '../components/CombinedScore';
import { SimpleRating } from '../components/SimpleRating';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#ef4444';
  return '#dc2626';
};

const getTrustLabel = (score: number): string => {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'FIABLE';
  if (score >= 40) return 'NEUTRE';
  if (score >= 20) return 'PRUDENCE';
  return 'RISQUÉ';
};

export const SimpleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  
  const { data: influencer, isLoading } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });
  
  if (isLoading || !influencer) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const dramaCount = influencer.mentions?.filter((m: Mention) => m.label === 'drama').length || 0;
  const goodCount = influencer.mentions?.filter((m: Mention) => m.label === 'good_action').length || 0;
  const neutralCount = influencer.mentions?.filter((m: Mention) => m.label === 'neutral').length || 0;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{influencer.name}</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=200&background=random&bold=true`
            }}
            style={styles.profileImage}
          />
          
          <Text style={styles.profileName}>{influencer.name}</Text>
          {influencer.niche && <Text style={styles.profileNiche}>{influencer.niche}</Text>}
        </View>
        
        {/* Combined Score */}
        <CombinedScore influencerId={influencer.id} aiScore={influencer.trustScore} />
        
        {/* Rating Component */}
        <SimpleRating
          influencerId={influencer.id}
          influencerName={influencer.name}
          onRatingSubmitted={() => {
            // Refresh data after rating
          }}
        />
        
        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dramaCount}</Text>
              <Text style={styles.statLabel}>Dramas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goodCount}</Text>
              <Text style={styles.statLabel}>Positive</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{neutralCount}</Text>
              <Text style={styles.statLabel}>Neutral</Text>
            </View>
          </View>
        </View>
        
        {/* Mentions */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <View style={styles.mentionsSection}>
            <Text style={styles.sectionTitle}>MENTIONS ({influencer.mentions.length})</Text>
            {influencer.mentions.slice(0, 20).map((mention: Mention) => (
              <View key={mention.id} style={styles.mentionCard}>
                <View style={[styles.mentionIndicator, { backgroundColor: getMentionColor(mention.label) }]} />
                <View style={styles.mentionContent}>
                  <Text style={styles.mentionLabel}>{mention.label.toUpperCase().replace('_', ' ')}</Text>
                  <Text style={styles.mentionText} numberOfLines={2}>{mention.textExcerpt}</Text>
                  <Text style={styles.mentionSource}>{mention.source}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

function getMentionColor(label: string): string {
  if (label === 'drama') return '#ef4444';
  if (label === 'good_action') return '#10b981';
  return '#9ca3af';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  profileNiche: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 24,
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  scorePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    position: 'absolute',
    bottom: 20,
    right: 18,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 2,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 2,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  mentionsSection: {
    padding: 16,
  },
  mentionCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  mentionIndicator: {
    width: 4,
  },
  mentionContent: {
    flex: 1,
    padding: 12,
  },
  mentionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mentionText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000',
    lineHeight: 18,
    marginBottom: 4,
  },
  mentionSource: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
});
