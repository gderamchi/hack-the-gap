import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { transparencyApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface ClaimProfileButtonProps {
  influencerId: string;
  influencerName: string;
  isClaimed?: boolean;
  onClaimSubmitted?: () => void;
}

export const ClaimProfileButton: React.FC<ClaimProfileButtonProps> = ({
  influencerId,
  influencerName,
  isClaimed,
  onClaimSubmitted,
}) => {
  const { isAuthenticated } = useSupabaseAuth();
  const [showModal, setShowModal] = useState(false);
  const [proofType, setProofType] = useState('social_media_post');
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (isClaimed) {
    return (
      <View style={styles.claimedContainer}>
        <Text style={styles.claimedText}>✓ Profile Claimed & Verified</Text>
      </View>
    );
  }

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to claim this profile');
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!proofText.trim()) {
      Alert.alert('Error', 'Please provide proof of ownership');
      return;
    }

    setLoading(true);
    try {
      await transparencyApi.createClaimRequest({
        influencerId,
        proofType,
        proofText: proofText.trim(),
        proofUrl: proofUrl.trim() || undefined,
      });

      Alert.alert(
        'Claim Submitted!',
        'Your claim request has been submitted for review. You will be notified once it is processed.',
        [{ text: 'OK', onPress: () => setShowModal(false) }]
      );

      setProofText('');
      setProofUrl('');
      onClaimSubmitted?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.claimButton}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <Text style={styles.claimButtonIcon}>👤</Text>
        <Text style={styles.claimButtonText}>Claim This Profile</Text>
      </TouchableOpacity>

      {/* Claim Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 Claim Profile</Text>
            <Text style={styles.modalSubtitle}>{influencerName}</Text>

            <Text style={styles.infoText}>
              To claim this profile, you need to provide proof that you are the influencer or their authorized representative.
            </Text>

            {/* Proof Type */}
            <Text style={styles.label}>Proof Type</Text>
            <View style={styles.proofTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.proofTypeButton,
                  proofType === 'social_media_post' && styles.proofTypeButtonActive,
                ]}
                onPress={() => setProofType('social_media_post')}
              >
                <Text style={[
                  styles.proofTypeText,
                  proofType === 'social_media_post' && styles.proofTypeTextActive,
                ]}>
                  Social Media
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.proofTypeButton,
                  proofType === 'email_verification' && styles.proofTypeButtonActive,
                ]}
                onPress={() => setProofType('email_verification')}
              >
                <Text style={[
                  styles.proofTypeText,
                  proofType === 'email_verification' && styles.proofTypeTextActive,
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.proofTypeButton,
                  proofType === 'official_document' && styles.proofTypeButtonActive,
                ]}
                onPress={() => setProofType('official_document')}
              >
                <Text style={[
                  styles.proofTypeText,
                  proofType === 'official_document' && styles.proofTypeTextActive,
                ]}>
                  Document
                </Text>
              </TouchableOpacity>
            </View>

            {/* Proof Text */}
            <Text style={styles.label}>Proof Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your proof (e.g., 'Posted verification code on my Instagram story')"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={proofText}
              onChangeText={setProofText}
              textAlignVertical="top"
            />

            {/* Proof URL */}
            <Text style={styles.label}>Proof URL (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#9ca3af"
              value={proofUrl}
              onChangeText={setProofUrl}
              autoCapitalize="none"
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
                  <Text style={styles.submitButtonText}>Submit Claim</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  claimButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  claimedContainer: {
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065f46',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  proofTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  proofTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  proofTypeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  proofTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  proofTypeTextActive: {
    color: '#3b82f6',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
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
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
