import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, Animated } from 'react-native';
import { useLocalRatings } from '../hooks/useLocalRatings';

interface BeautifulRatingProps {
  influencerId: string;
  influencerName: string;
  onRatingChanged?: () => void;
}

export const BeautifulRating: React.FC<BeautifulRatingProps> = ({
  influencerId,
  influencerName,
  onRatingChanged,
}) => {
  const { saveRating, getRating } = useLocalRatings();
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);

  useEffect(() => {
    const existing = getRating(influencerId);
    if (existing) {
      setCurrentRating(existing.rating);
      setComment(existing.comment || '');
    }
  }, [influencerId]);

  const handleStarPress = (rating: number) => {
    setTempRating(rating);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    await saveRating(influencerId, tempRating, comment.trim() || undefined);
    setCurrentRating(tempRating);
    setShowModal(false);
    onRatingChanged?.();
  };

  const displayRating = hoverRating || currentRating;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate this influencer</Text>
      
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            onPressIn={() => setHoverRating(star)}
            onPressOut={() => setHoverRating(0)}
            style={styles.starButton}
          >
            <Text style={[styles.star, star <= displayRating && styles.starFilled]}>
              {star <= displayRating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentRating > 0 && (
        <Text style={styles.yourRating}>
          Your rating: {currentRating} star{currentRating > 1 ? 's' : ''}
        </Text>
      )}

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
                  onPress={() => setTempRating(star)}
                >
                  <Text style={styles.modalStar}>
                    {star <= tempRating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>
              {tempRating === 1 && '⭐ Poor'}
              {tempRating === 2 && '⭐⭐ Fair'}
              {tempRating === 3 && '⭐⭐⭐ Good'}
              {tempRating === 4 && '⭐⭐⭐⭐ Very Good'}
              {tempRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
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
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit</Text>
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
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    margin: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 36,
    color: '#d1d5db',
  },
  starFilled: {
    color: '#fbbf24',
  },
  yourRating: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  modalStar: {
    fontSize: 44,
    color: '#fbbf24',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
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
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
