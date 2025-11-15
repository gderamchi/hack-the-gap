import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, Chip } from 'react-native-paper';
import { Influencer } from '../types';
import { getTrustColor } from '../constants/theme';

interface Props {
  influencer: Influencer;
  onPress: () => void;
}

export const InfluencerCard: React.FC<Props> = ({ influencer, onPress }) => {
  const trustColor = getTrustColor(influencer.trustScore);
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <Text variant="titleLarge" style={styles.name}>
                {influencer.name}
              </Text>
              {influencer.niche && (
                <Chip mode="outlined" compact style={styles.chip}>
                  {influencer.niche}
                </Chip>
              )}
            </View>
            <View style={styles.scoreContainer}>
              <Text variant="headlineMedium" style={[styles.score, { color: trustColor }]}>
                {Math.round(influencer.trustScore)}%
              </Text>
              <Text variant="bodySmall" style={styles.trustLevel}>
                {influencer.trustLevel || 'N/A'}
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={influencer.trustScore / 100}
            color={trustColor}
            style={styles.progressBar}
          />
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Dramas
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {influencer.dramaCount}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Actions positives
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {influencer.goodActionCount}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Neutres
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {influencer.neutralCount}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankBadge: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  name: {
    fontWeight: 'bold',
    flex: 1,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontWeight: 'bold',
  },
  trustLevel: {
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
});
