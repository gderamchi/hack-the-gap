import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { Mention } from '../types';

interface Props {
  mention: Mention;
}

export const MentionCard: React.FC<Props> = ({ mention }) => {
  const getLabelColor = (label: string) => {
    switch (label) {
      case 'drama':
        return '#ef4444';
      case 'good_action':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };
  
  const getLabelText = (label: string) => {
    switch (label) {
      case 'drama':
        return 'Drama';
      case 'good_action':
        return 'Action positive';
      default:
        return 'Neutre';
    }
  };
  
  const handleOpenUrl = () => {
    if (mention.sourceUrl) {
      Linking.openURL(mention.sourceUrl);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Chip
            mode="flat"
            style={[styles.labelChip, { backgroundColor: getLabelColor(mention.label) + '20' }]}
            textStyle={{ color: getLabelColor(mention.label) }}
          >
            {getLabelText(mention.label)}
          </Chip>
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(mention.scrapedAt)}
          </Text>
        </View>
        
        <Text variant="bodyMedium" style={styles.excerpt}>
          {mention.textExcerpt}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.sourceContainer}>
            <Text variant="bodySmall" style={styles.source}>
              Source: {mention.source}
            </Text>
            <Text variant="bodySmall" style={styles.sentiment}>
              Sentiment: {(mention.sentimentScore * 100).toFixed(0)}%
            </Text>
          </View>
          <IconButton
            icon="open-in-new"
            size={20}
            onPress={handleOpenUrl}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelChip: {
    height: 28,
  },
  date: {
    opacity: 0.7,
  },
  excerpt: {
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flex: 1,
  },
  source: {
    opacity: 0.7,
    marginBottom: 2,
  },
  sentiment: {
    opacity: 0.7,
  },
});
