import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.80.222.41:3000/api';

interface KnowMoreButtonProps {
  influencerId: string;
  influencerName: string;
  niche: string;
}

export const KnowMoreButton: React.FC<KnowMoreButtonProps> = ({
  influencerId,
  influencerName,
  niche,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const fetchDetailedInfo = async () => {
    setLoading(true);
    setShowModal(true);
    
    try {
      const response = await axios.post(`${API_URL}/influencers/know-more`, {
        name: influencerName,
        niche: niche,
      });
      
      // Remove citation numbers like [1], [2], [10] etc.
      const cleanContent = response.data.content
        .replace(/\[\d+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      setContent(cleanContent);
    } catch (error) {
      setContent('Failed to fetch information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Simple markdown formatting for React Native
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.h1}>
            {line.replace('# ', '')}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.h2}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={styles.h3}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      
      // Bold
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <Text key={i} style={styles.bold}>{part}</Text> : part
            )}
          </Text>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <Text key={index} style={styles.bullet}>
            • {line.replace(/^[-•]\s*/, '')}
          </Text>
        );
      }
      
      // Regular paragraph
      if (line.trim()) {
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
      
      return <View key={index} style={{ height: 10 }} />;
    });
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={fetchDetailedInfo}>
        <Text style={styles.buttonIcon}>📖</Text>
        <Text style={styles.buttonText}>Know More</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{influencerName}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>
                  Researching latest information...
                </Text>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                {formatMarkdown(content)}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 10,
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#000',
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 15,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
  bullet: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 10,
  },
});
