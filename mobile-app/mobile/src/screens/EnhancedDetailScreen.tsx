import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { influencerApi } from '../services/api';
import { BeautifulRating } from '../components/BeautifulRating';
import { useLocalRatings } from '../hooks/useLocalRatings';
import { KnowMoreButton } from '../components/KnowMoreButton';
import { CommunityVoting } from '../components/CommunityVoting';
import { CommunitySignals } from '../components/CommunitySignals';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import { EventTimelineView } from '../components/EventTimelineView';
import { ClaimProfileButton } from '../components/ClaimProfileButton';
import { SubscriptionLimitBanner } from '../components/SubscriptionLimitBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const getTrustColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getTrustLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

export const EnhancedDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  const { getRating } = useLocalRatings();
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const { data: influencer, isLoading, refetch } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });

  const handleCommunityUpdate = () => {
    refetch();
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (isLoading || !influencer) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const trustColor = getTrustColor(influencer.trustScore);
  const trustLabel = getTrustLabel(influencer.trustScore);
  const socialHandles = typeof influencer.socialHandles === 'string' 
    ? JSON.parse(influencer.socialHandles) 
    : influencer.socialHandles || {};
  const userRating = getRating(influencer.id);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {influencer.imageUrl && (
            <Image source={{ uri: influencer.imageUrl }} style={styles.profileImage} />
          )}
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{influencer.name}</Text>
            <Text style={styles.profileNiche}>{influencer.niche || 'General'}</Text>
            {socialHandles.platform && (
              <Text style={styles.profilePlatform}>
                {socialHandles.platform} • {socialHandles.followers}
              </Text>
            )}
          </View>
        </View>
        
        {/* Trust Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Trust Score</Text>
            <Text style={[styles.scoreLabel, { color: trustColor }]}>{trustLabel}</Text>
          </View>
          
          <View style={styles.scoreDisplay}>
            <View style={[styles.scoreBadgeLarge, { backgroundColor: trustColor }]}>
              <Text style={styles.scoreValueLarge}>{Math.round(influencer.trustScore)}</Text>
              <Text style={styles.scorePercent}>%</Text>
            </View>
            
            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemValue}>{influencer.dramaCount}</Text>
                <Text style={styles.scoreItemLabel}>Dramas</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemValue}>{influencer.goodActionCount}</Text>
                <Text style={styles.scoreItemLabel}>Positive</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemValue}>{influencer.neutralCount}</Text>
                <Text style={styles.scoreItemLabel}>Neutral</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Summary */}
        {influencer.summary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.summaryText}>{influencer.summary}</Text>
          </View>
        )}
        
        {/* Know More Button */}
        <KnowMoreButton
          influencerId={influencer.id}
          influencerName={influencer.name}
          niche={influencer.niche || 'General'}
        />
        
        {/* Claim Profile Button */}
        <ClaimProfileButton
          influencerId={influencer.id}
          influencerName={influencer.name}
          isClaimed={influencer.isClaimed}
          onClaimSubmitted={handleCommunityUpdate}
        />
        
        {/* Score Breakdown */}
        <ScoreBreakdownCard
          influencerId={influencer.id}
          refreshTrigger={refreshTrigger}
        />
        
        {/* Subscription Limit Banner */}
        <SubscriptionLimitBanner />
        
        {/* Community Voting */}
        <CommunityVoting
          influencerId={influencer.id}
          influencerName={influencer.name}
          onVoteSubmitted={handleCommunityUpdate}
        />
        
        {/* Community Signals & Stats */}
        <CommunitySignals
          influencerId={influencer.id}
          refreshTrigger={refreshTrigger}
        />
        
        {/* Event Timeline */}
        <EventTimelineView
          influencerId={influencer.id}
          refreshTrigger={refreshTrigger}
        />
        
        {/* Rating Section (Legacy - keeping for backward compatibility) */}
        <BeautifulRating
          influencerId={influencer.id}
          influencerName={influencer.name}
          onRatingChanged={() => refetch()}
        />
        
        {/* Your Rating Display */}
        {userRating && (
          <View style={styles.yourRatingCard}>
            <Text style={styles.yourRatingTitle}>Your Rating</Text>
            <View style={styles.yourRatingContent}>
              <Text style={styles.yourRatingStars}>
                {'★'.repeat(userRating.rating)}{'☆'.repeat(5 - userRating.rating)}
              </Text>
              {userRating.comment && (
                <Text style={styles.yourRatingComment}>"{userRating.comment}"</Text>
              )}
            </View>
          </View>
        )}
        
        {/* Mentions */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Recent Mentions ({influencer.mentions.length})
            </Text>
            {influencer.mentions.slice(0, 8).map((mention: any, idx: number) => (
              <View key={mention.id} style={styles.mention}>
                <View style={styles.mentionHeader}>
                  <Text style={styles.mentionLabel}>
                    {mention.label === 'drama' ? '🔴 Drama' : 
                     mention.label === 'good_action' ? '🟢 Positive' : '⚪ Neutral'}
                  </Text>
                  <Text style={styles.mentionDate}>
                    {new Date(mention.scrapedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.mentionText} numberOfLines={3}>
                  {mention.textExcerpt}
                </Text>
                <Text style={styles.mentionSource}>{mention.source}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date(influencer.lastUpdated).toLocaleDateString()}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 5,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 24,
    color: '#000',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileNiche: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  profilePlatform: {
    fontSize: 13,
    color: '#9ca3af',
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadgeLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreValueLarge: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  scorePercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    position: 'absolute',
    bottom: 22,
    right: 18,
  },
  scoreBreakdown: {
    flex: 1,
    gap: 8,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItemValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  scoreItemLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#374151',
  },
  yourRatingCard: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  yourRatingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  yourRatingContent: {
    // No extra styles
  },
  yourRatingStars: {
    fontSize: 24,
    color: '#fbbf24',
    marginBottom: 6,
  },
  yourRatingComment: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#78350f',
  },
  mention: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mentionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  mentionDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  mentionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  mentionSource: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
