import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SimpleRatingProps {
  influencerId: string;
  influencerName: string;
  onRatingSubmitted?: () => void;
}

export const SimpleRating: React.FC<SimpleRatingProps> = ({
  influencerId,
  influencerName,
  onRatingSubmitted,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = async (star: number) => {
    // Check if user is authenticated
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to rate influencers');
      return;
    }
    
    setRating(star);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    
    setSubmitting(true);
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('community_ratings')
        .upsert({
          user_id: user.id,
          influencer_id: influencerId,
          rating,
          comment: comment.trim() || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,influencer_id',
        });

      if (error) throw error;

      Alert.alert('✅ Thank you!', 'Your rating has been saved');
      setShowModal(false);
      setComment('');
      onRatingSubmitted?.();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YOUR RATING</Text>
      
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
          >
            <Text style={styles.star}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate {influencerName}</Text>
            
            <View style={styles.modalStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text style={styles.modalStar}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitText}>
                  {submitting ? 'Sending...' : 'Submit'}
                </Text>
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
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalStar: {
    fontSize: 40,
  },
  commentInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
});
