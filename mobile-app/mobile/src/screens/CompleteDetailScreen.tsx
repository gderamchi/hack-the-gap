import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, StatusBar, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Mention } from '../types';
import { influencerApi } from '../services/api';
import { BeautifulRating } from '../components/BeautifulRating';

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
  if (score >= 60) return 'TRUSTWORTHY';
  if (score >= 40) return 'NEUTRAL';
  if (score >= 20) return 'CAUTION';
  return 'RISKY';
};

export const CompleteDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  
  const { data: influencer, isLoading, refetch } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });
  
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
  
  const dramaCount = influencer.mentions?.filter((m: Mention) => m.label === 'drama').length || influencer.dramaCount || 0;
  const goodCount = influencer.mentions?.filter((m: Mention) => m.label === 'good_action').length || influencer.goodActionCount || 0;
  const neutralCount = influencer.mentions?.filter((m: Mention) => m.label === 'neutral').length || influencer.neutralCount || 0;
  
  const socialHandles = typeof influencer.socialHandles === 'string' 
    ? JSON.parse(influencer.socialHandles) 
    : influencer.socialHandles || {};
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{influencer.name}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=200` }}
            style={styles.profileImage}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{influencer.name}</Text>
            {influencer.niche && <Text style={styles.profileNiche}>{influencer.niche}</Text>}
            {socialHandles.platform && (
              <Text style={styles.profilePlatform}>
                {socialHandles.platform} • {socialHandles.followers}
              </Text>
            )}
          </View>
        </View>
        
        {/* AI Summary */}
        {influencer.summary && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.summaryText}>{influencer.summary}</Text>
          </View>
        )}
        
        {/* Trust Score Display */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>TRUST SCORE</Text>
          <View style={[styles.scoreCircle, { borderColor: trustColor }]}>
            <Text style={[styles.scoreText, { color: trustColor }]}>{Math.round(influencer.trustScore)}</Text>
            <Text style={styles.scorePercent}>%</Text>
          </View>
          <Text style={[styles.scoreLabelText, { color: trustColor }]}>{trustLabel}</Text>
        </View>
        
        {/* Detailed Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>DETAILED STATISTICS</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(influencer.trustScore)}</Text>
              <Text style={styles.statLabel}>AI Score</Text>
              <Text style={[styles.statBadge, { color: trustColor }]}>{trustLabel}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{dramaCount}</Text>
              <Text style={styles.statLabel}>Dramas</Text>
              <Text style={styles.statSubtext}>Controversies</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{goodCount}</Text>
              <Text style={styles.statLabel}>Positive</Text>
              <Text style={styles.statSubtext}>Good Actions</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{neutralCount}</Text>
              <Text style={styles.statLabel}>Neutral</Text>
              <Text style={styles.statSubtext}>Mentions</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{(influencer.avgSentiment || 0).toFixed(2)}</Text>
              <Text style={styles.statLabel}>Sentiment</Text>
              <Text style={styles.statSubtext}>Average</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{influencer.mentions?.length || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statSubtext}>Mentions</Text>
            </View>
          </View>
        </View>
        
        {/* Community Rating */}
        <BeautifulRating
          influencerId={influencer.id}
          influencerName={influencer.name}
          onRatingChanged={() => refetch()}
        />
        
        {/* Recent Mentions */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <View style={styles.mentionsSection}>
            <Text style={styles.sectionTitle}>RECENT MENTIONS ({influencer.mentions.length})</Text>
            {influencer.mentions.slice(0, 15).map((mention: Mention) => (
              <View key={mention.id} style={styles.mentionCard}>
                <View style={[styles.mentionIndicator, { backgroundColor: getMentionColor(mention.label) }]} />
                <View style={styles.mentionContent}>
                  <View style={styles.mentionHeader}>
                    <Text style={styles.mentionLabel}>{mention.label.toUpperCase().replace('_', ' ')}</Text>
                    <Text style={styles.mentionSentiment}>
                      {mention.sentimentScore > 0 ? '😊' : mention.sentimentScore < 0 ? '😞' : '😐'}
                      {' '}{mention.sentimentScore.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.mentionText} numberOfLines={3}>{mention.textExcerpt}</Text>
                  <Text style={styles.mentionMeta}>
                    {mention.source} • {new Date(mention.scrapedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Last Updated */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date(influencer.lastUpdated).toLocaleString()}
          </Text>
        </View>
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
    marginTop: 12,
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
  refreshButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  profileNiche: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  profilePlatform: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  summarySection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 22,
  },
  scoreSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: '900',
  },
  scorePercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9ca3af',
    position: 'absolute',
    bottom: 30,
    right: 25,
  },
  scoreLabelText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#f9fafb',
    padding: 12,
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
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 9,
    fontWeight: '500',
    color: '#9ca3af',
  },
  statBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
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
  mentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mentionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  mentionSentiment: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  mentionText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000',
    lineHeight: 18,
    marginBottom: 6,
  },
  mentionMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
});
