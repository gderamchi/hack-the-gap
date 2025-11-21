import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { engagementApi } from '../services/api';
import { LeaderboardList } from '../components/LeaderboardList';
import { UserStatsCard } from '../components/UserStatsCard';

type LeaderboardTab = 'top-rated' | 'improved' | 'risk' | 'trending' | 'contributors' | 'users';

export const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('top-rated');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let result: any[] = [];

      switch (activeTab) {
        case 'top-rated':
          result = await engagementApi.getTopRated(20);
          break;
        case 'improved':
          result = await engagementApi.getMostImproved(period, 20);
          break;
        case 'risk':
          result = await engagementApi.getHighestRisk(period, 20);
          break;
        case 'trending':
          result = await engagementApi.getTrending(20);
          break;
        case 'contributors':
          result = await engagementApi.getTopContributors(period, 20);
          break;
        case 'users':
          result = await engagementApi.getActiveUsers(period, 20);
          break;
      }

      setData(result);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'top-rated', label: '🥇 Top Rated', type: 'influencer' },
    { id: 'improved', label: '📈 Improved', type: 'influencer' },
    { id: 'risk', label: '🚨 Risk', type: 'influencer' },
    { id: 'trending', label: '🔥 Trending', type: 'influencer' },
    { id: 'contributors', label: '🏆 Contributors', type: 'user' },
    { id: 'users', label: '👑 Active', type: 'user' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);
  const showPeriodSelector = ['improved', 'risk', 'contributors', 'users'].includes(activeTab);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.subtitle}>Top performers & trending</Text>
      </View>

      {/* User Stats Card */}
      <UserStatsCard />

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.id as LeaderboardTab)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Period Selector */}
      {showPeriodSelector && (
        <View style={styles.periodContainer}>
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                period === p && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Leaderboard List */}
      <LeaderboardList
        data={data}
        type={currentTab?.type as 'influencer' | 'user'}
        emptyMessage={getEmptyMessage(activeTab)}
      />

      {/* Refresh Control */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const getEmptyMessage = (tab: LeaderboardTab): string => {
  switch (tab) {
    case 'top-rated':
      return 'No influencers rated yet';
    case 'improved':
      return 'No improvements detected yet';
    case 'risk':
      return 'No risks detected yet';
    case 'trending':
      return 'No trending influencers yet';
    case 'users':
      return 'No active users yet';
    default:
      return 'No data available';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodTextActive: {
    color: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
