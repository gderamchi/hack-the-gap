import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { transparencyApi } from '../services/api';

interface ScoreBreakdownCardProps {
  influencerId: string;
  refreshTrigger?: number;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  influencerId,
  refreshTrigger,
}) => {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadBreakdown();
  }, [influencerId, refreshTrigger]);

  const loadBreakdown = async () => {
    try {
      setLoading(true);
      const data = await transparencyApi.getScoreBreakdown(influencerId);
      setBreakdown(data);
    } catch (error) {
      console.error('Failed to load score breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (!breakdown) {
    return null;
  }

  const { aiScore, communityScore } = breakdown;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>📊 Score Breakdown</Text>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>AI Score</Text>
          <Text style={[styles.summaryValue, { color: getScoreColor(aiScore.total) }]}>
            {Math.round(aiScore.total)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Community Score</Text>
          <Text style={[styles.summaryValue, { color: getScoreColor(communityScore.total) }]}>
            {Math.round(communityScore.total)}
          </Text>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <>
          {/* AI Score Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI Score Components</Text>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Base Score</Text>
              <Text style={styles.componentValue}>+{aiScore.components.base}</Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Drama Impact</Text>
              <Text style={[styles.componentValue, { color: '#ef4444' }]}>
                {aiScore.components.dramaImpact > 0 ? '+' : ''}{aiScore.components.dramaImpact}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Positive Impact</Text>
              <Text style={[styles.componentValue, { color: '#10b981' }]}>
                +{aiScore.components.positiveImpact}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Sentiment Impact</Text>
              <Text style={styles.componentValue}>
                {aiScore.components.sentimentImpact > 0 ? '+' : ''}{aiScore.components.sentimentImpact}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.componentRow}>
              <Text style={styles.totalLabel}>Total AI Score</Text>
              <Text style={[styles.totalValue, { color: getScoreColor(aiScore.total) }]}>
                {Math.round(aiScore.total)}
              </Text>
            </View>
          </View>

          {/* Community Score Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Community Score Components</Text>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Base Score</Text>
              <Text style={styles.componentValue}>+{communityScore.components.base}</Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Rating Impact</Text>
              <Text style={[styles.componentValue, { color: '#10b981' }]}>
                {communityScore.components.ratingImpact > 0 ? '+' : ''}{communityScore.components.ratingImpact}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Drama Reports</Text>
              <Text style={[styles.componentValue, { color: '#ef4444' }]}>
                {communityScore.components.dramaImpact}
              </Text>
            </View>
            <View style={styles.componentRow}>
              <Text style={styles.componentLabel}>Positive Reports</Text>
              <Text style={[styles.componentValue, { color: '#10b981' }]}>
                +{communityScore.components.positiveImpact}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.componentRow}>
              <Text style={styles.totalLabel}>Total Community Score</Text>
              <Text style={[styles.totalValue, { color: getScoreColor(communityScore.total) }]}>
                {Math.round(communityScore.total)}
              </Text>
            </View>
          </View>

          {/* Top Events */}
          {aiScore.topDramas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚨 Top Drama Events</Text>
              {aiScore.topDramas.slice(0, 3).map((event: any, idx: number) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventSeverity}>{getSeverityEmoji(event.severity)}</Text>
                    <Text style={styles.eventImpact}>{event.impact.toFixed(1)} pts</Text>
                  </View>
                  <Text style={styles.eventText} numberOfLines={2}>
                    {event.text}
                  </Text>
                  <Text style={styles.eventSource}>{event.source}</Text>
                </View>
              ))}
            </View>
          )}

          {aiScore.topPositive.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Top Positive Events</Text>
              {aiScore.topPositive.slice(0, 3).map((event: any, idx: number) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventSeverity}>{getSeverityEmoji(event.severity)}</Text>
                    <Text style={[styles.eventImpact, { color: '#10b981' }]}>
                      +{event.impact.toFixed(1)} pts
                    </Text>
                  </View>
                  <Text style={styles.eventText} numberOfLines={2}>
                    {event.text}
                  </Text>
                  <Text style={styles.eventSource}>{event.source}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getSeverityEmoji = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL': return '🔴';
    case 'HIGH': return '🟠';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  expandIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  componentLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  componentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventSeverity: {
    fontSize: 16,
  },
  eventImpact: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  eventText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    marginBottom: 6,
  },
  eventSource: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
