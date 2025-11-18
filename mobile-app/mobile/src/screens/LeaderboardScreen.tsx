import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { engagementApi } from '../services/api';
import { LeaderboardList } from '../components/LeaderboardList';
import { UserStatsCard } from '../components/UserStatsCard';

type LeaderboardTab = 'contributors' | 'drama-reporters' | 'positive-reporters' | 'users';

export const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('contributors');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('WEEKLY');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let result: any[] = [];

      switch (activeTab) {
        case 'contributors':
          result = await engagementApi.getTopContributors(period, 20);
          break;
        case 'drama-reporters':
          result = await engagementApi.getTopDramaReporters(period, 20);
          break;
        case 'positive-reporters':
          result = await engagementApi.getTopPositiveReporters(period, 20);
          break;
        case 'users':
          result = await engagementApi.getActiveUsers(period, 20);
          break;
      }

      setData(result);
    } catch (error: any) {
      // Silently handle errors and show empty state
      console.log('Failed to load leaderboard:', error.message || 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'contributors', label: '🏆 All Contributors', type: 'user' },
    { id: 'drama-reporters', label: '🚨 Drama Reporters', type: 'user' },
    { id: 'positive-reporters', label: '✨ Good Actions', type: 'user' },
    { id: 'users', label: '👑 Active Users', type: 'user' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contributors</Text>
        <Text style={styles.subtitle}>Top community contributors</Text>
      </View>

      {/* User Stats Card */}
      <View style={styles.statsWrapper}>
        <UserStatsCard />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
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
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {(['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'] as const).map((p) => (
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
              {p === 'ALL_TIME' ? 'All Time' : p.charAt(0) + p.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <LeaderboardList
        data={data}
        type="user"
        emptyMessage={getEmptyMessage(activeTab)}
      />

      {/* Loading Overlay */}
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
    case 'contributors':
      return 'No contributors yet. Start reporting!';
    case 'drama-reporters':
      return 'No drama reporters yet. Report controversies!';
    case 'positive-reporters':
      return 'No positive reporters yet. Share good actions!';
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
  statsWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
  },
  tabsContent: {
    paddingHorizontal: 15,
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
