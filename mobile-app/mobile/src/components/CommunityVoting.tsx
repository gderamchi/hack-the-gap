import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { communityApi, engagementApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface CommunityVotingProps {
  influencerId: string;
  influencerName: string;
  onVoteSubmitted?: () => void;
}

export const CommunityVoting: React.FC<CommunityVotingProps> = ({
  influencerId,
  influencerName,
  onVoteSubmitted,
}) => {
  const { isAuthenticated } = useSupabaseAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION'>('RATING');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenModal = async (type: 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION') => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote or report');
      return;
    }

    // Check subscription limits for reports (not ratings)
    if (type === 'DRAMA_REPORT' || type === 'POSITIVE_ACTION') {
      try {
        const subscription = await engagementApi.getMySubscription();
        
        if (subscription.remaining === 0) {
          Alert.alert(
            'Report Limit Reached',
            `You've used all ${subscription.monthlyReportsLimit} reports this month.\n\nUpgrade to PREMIUM for 50 reports/month or PROFESSIONAL for unlimited reports!`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upgrade', onPress: showPricing },
            ]
          );
          return;
        }

        if (subscription.remaining <= 2 && subscription.remaining > 0) {
          Alert.alert(
            'Low on Reports',
            `You have ${subscription.remaining} report${subscription.remaining > 1 ? 's' : ''} remaining this month.`,
            [
              { text: 'Continue', onPress: () => openModal(type) },
              { text: 'Upgrade', onPress: showPricing },
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }

    openModal(type);
  };

  const openModal = (type: 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION') => {
    setModalType(type);
    setRating(0);
    setComment('');
    setShowModal(true);
  };

  const showPricing = async () => {
    try {
      const pricing = await engagementApi.getPricing();
      Alert.alert(
        'Subscription Plans',
        `FREE: ${pricing.FREE.monthlyReports} reports/month\n\n` +
        `PREMIUM (€${pricing.PREMIUM.price}/month):\n${pricing.PREMIUM.monthlyReports} reports/month\n\n` +
        `PROFESSIONAL (€${pricing.PROFESSIONAL.price}/month):\nUnlimited reports`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load pricing');
    }
  };

  const handleSubmit = async () => {
    if (modalType === 'RATING' && rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await communityApi.createSignal({
        influencerId,
        type: modalType,
        rating: modalType === 'RATING' ? rating : undefined,
        comment: comment.trim() || undefined,
      });

      Alert.alert(
        'Submitted for Verification!',
        modalType === 'RATING' 
          ? 'Your rating is being verified. You will be notified by email once it is reviewed (usually within minutes).' 
          : modalType === 'DRAMA_REPORT'
          ? 'Your drama report is being verified by our AI system. You will receive an email notification once it is reviewed.'
          : 'Your positive action report is being verified. You will be notified by email once it is approved.',
        [{ text: 'OK' }]
      );

      setShowModal(false);
      onVoteSubmitted?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Actions</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.ratingButton]}
          onPress={() => handleOpenModal('RATING')}
        >
          <Text style={styles.buttonIcon}>⭐</Text>
          <Text style={styles.buttonText}>Rate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dramaButton]}
          onPress={() => handleOpenModal('DRAMA_REPORT')}
        >
          <Text style={styles.buttonIcon}>🚨</Text>
          <Text style={styles.buttonText}>Report Drama</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.positiveButton]}
          onPress={() => handleOpenModal('POSITIVE_ACTION')}
        >
          <Text style={styles.buttonIcon}>✨</Text>
          <Text style={styles.buttonText}>Report Positive</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'RATING' && '⭐ Rate Influencer'}
              {modalType === 'DRAMA_REPORT' && '🚨 Report Drama'}
              {modalType === 'POSITIVE_ACTION' && '✨ Report Positive Action'}
            </Text>

            <Text style={styles.modalSubtitle}>{influencerName}</Text>

            {/* Rating Stars */}
            {modalType === 'RATING' && (
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Text style={styles.star}>
                      {star <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Comment */}
            <TextInput
              style={styles.commentInput}
              placeholder={
                modalType === 'RATING'
                  ? 'Add a comment (optional)'
                  : modalType === 'DRAMA_REPORT'
                  ? 'Describe the drama or controversy...'
                  : 'Describe the positive action...'
              }
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  ratingButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  dramaButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  positiveButton: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 40,
    color: '#fbbf24',
  },
  commentInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#000',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
