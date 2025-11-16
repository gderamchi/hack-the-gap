import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { transparencyApi } from '../services/api';

interface EventTimelineViewProps {
  influencerId: string;
  refreshTrigger?: number;
}

export const EventTimelineView: React.FC<EventTimelineViewProps> = ({
  influencerId,
  refreshTrigger,
}) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadTimeline();
  }, [influencerId, refreshTrigger, limit]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await transparencyApi.getTimeline(influencerId, { limit });
      setTimeline(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && timeline.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📅 Event Timeline</Text>
        <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (timeline.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📅 Event Timeline</Text>
        <Text style={styles.emptyText}>No events yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Event Timeline ({timeline.length})</Text>

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {timeline.map((event, index) => (
          <View key={`${event.type}-${event.id}`} style={styles.eventContainer}>
            {/* Timeline Line */}
            {index < timeline.length - 1 && <View style={styles.timelineLine} />}

            {/* Event Dot */}
            <View style={[styles.eventDot, { backgroundColor: getEventColor(event) }]} />

            {/* Event Card */}
            <View style={styles.eventCard}>
              {/* Header */}
              <View style={styles.eventHeader}>
                <Text style={styles.eventType}>{getEventIcon(event)} {getEventLabel(event)}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString()}
                </Text>
              </View>

              {/* Content */}
              {event.type === 'MENTION' && (
                <>
                  <View style={styles.eventMeta}>
                    <Text style={styles.severityBadge}>
                      {getSeverityEmoji(event.severity)} {event.severity}
                    </Text>
                    {event.scoreImpact !== 0 && (
                      <Text style={[styles.impactBadge, { 
                        color: event.scoreImpact > 0 ? '#10b981' : '#ef4444' 
                      }]}>
                        {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact?.toFixed(1)} pts
                      </Text>
                    )}
                    {event.isVerified && (
                      <Text style={styles.verifiedBadge}>✓ Verified</Text>
                    )}
                  </View>
                  <Text style={styles.eventText} numberOfLines={3}>
                    {event.text}
                  </Text>
                  <Text style={styles.eventSource}>Source: {event.source}</Text>
                </>
              )}

              {event.type === 'COMMUNITY_SIGNAL' && (
                <>
                  {event.rating && (
                    <Text style={styles.rating}>
                      {'★'.repeat(event.rating)}{'☆'.repeat(5 - event.rating)}
                    </Text>
                  )}
                  {event.comment && (
                    <Text style={styles.eventText} numberOfLines={3}>
                      "{event.comment}"
                    </Text>
                  )}
                  {event.user && (
                    <Text style={styles.eventUser}>
                      by {event.user.firstName || 'Anonymous'}
                      {event.user.role === 'PROFESSIONAL' && ' 🔹'}
                      {event.user.role === 'ADMIN' && ' ⭐'}
                    </Text>
                  )}
                </>
              )}

              {/* Responses */}
              {event.responses && event.responses.length > 0 && (
                <View style={styles.responsesContainer}>
                  <Text style={styles.responsesLabel}>
                    💬 {event.responses.length} Response{event.responses.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Load More */}
      {timeline.length >= limit && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={() => setLimit(limit + 10)}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getEventColor = (event: any): string => {
  if (event.type === 'MENTION') {
    if (event.label === 'drama') return '#ef4444';
    if (event.label === 'good_action') return '#10b981';
    return '#9ca3af';
  }
  if (event.type === 'COMMUNITY_SIGNAL') {
    if (event.signalType === 'DRAMA_REPORT') return '#ef4444';
    if (event.signalType === 'POSITIVE_ACTION') return '#10b981';
    if (event.signalType === 'RATING') return '#fbbf24';
    return '#9ca3af';
  }
  return '#9ca3af';
};

const getEventIcon = (event: any): string => {
  if (event.type === 'MENTION') {
    if (event.label === 'drama') return '🚨';
    if (event.label === 'good_action') return '✨';
    return '📰';
  }
  if (event.type === 'COMMUNITY_SIGNAL') {
    if (event.signalType === 'DRAMA_REPORT') return '🚨';
    if (event.signalType === 'POSITIVE_ACTION') return '✨';
    if (event.signalType === 'RATING') return '⭐';
    return '💬';
  }
  return '📌';
};

const getEventLabel = (event: any): string => {
  if (event.type === 'MENTION') {
    if (event.label === 'drama') return 'Drama Detected';
    if (event.label === 'good_action') return 'Positive Action';
    return 'Mention';
  }
  if (event.type === 'COMMUNITY_SIGNAL') {
    if (event.signalType === 'DRAMA_REPORT') return 'Drama Report';
    if (event.signalType === 'POSITIVE_ACTION') return 'Positive Report';
    if (event.signalType === 'RATING') return 'Community Rating';
    return 'Comment';
  }
  return 'Event';
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  timeline: {
    maxHeight: 600,
  },
  eventContainer: {
    position: 'relative',
    paddingLeft: 30,
    marginBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  eventDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  eventCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  eventDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  severityBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  impactBadge: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
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
  rating: {
    fontSize: 18,
    color: '#fbbf24',
    marginBottom: 6,
  },
  eventUser: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  responsesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  responsesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  loadMoreButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});
