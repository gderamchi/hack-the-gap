import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { influencerApi } from '../services/api';
import { FadeInView } from '../components/FadeInView';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/designSystem';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export const SearchScreenRedesigned: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const queryClient = useQueryClient();
  
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  const searchMutation = useMutation({
    mutationFn: (influencerName: string) => influencerApi.search(influencerName, false),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      navigation.navigate('Detail', { influencerId: data.influencer.id });
    },
  });
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };
  
  const handleSearch = () => {
    if (!name.trim()) return;
    searchMutation.mutate(name.trim());
  };
  
  const inputScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Animated.Text style={styles.backIcon}>←</Animated.Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Hero Title */}
        <FadeInView delay={0}>
          <Animated.Text style={styles.title}>
            RECHERCHER
          </Animated.Text>
        </FadeInView>
        
        <FadeInView delay={100}>
          <Animated.Text style={styles.subtitle}>
            Découvrez la réputation d'un influenceur
          </Animated.Text>
        </FadeInView>
        
        {/* Search Input */}
        <FadeInView delay={200}>
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [{ scale: inputScale }],
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Nom de l'influenceur..."
              placeholderTextColor={COLORS.gray600}
              value={name}
              onChangeText={setName}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoCapitalize="words"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </Animated.View>
        </FadeInView>
        
        {/* Search Button */}
        <FadeInView delay={300}>
          <TouchableOpacity
            style={[
              styles.searchButton,
              searchMutation.isPending && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!name.trim() || searchMutation.isPending}
          >
            <Animated.Text style={styles.searchButtonText}>
              {searchMutation.isPending ? 'ANALYSE EN COURS...' : 'RECHERCHER'}
            </Animated.Text>
          </TouchableOpacity>
        </FadeInView>
        
        {/* Loading State */}
        {searchMutation.isPending && (
          <FadeInView delay={0}>
            <View style={styles.loadingContainer}>
              <Animated.Text style={styles.loadingText}>
                Analyse en cours...
              </Animated.Text>
              <Animated.Text style={styles.loadingSubtext}>
                Cela peut prendre 30-60 secondes
              </Animated.Text>
            </View>
          </FadeInView>
        )}
        
        {/* Info Section */}
        <FadeInView delay={400}>
          <View style={styles.infoSection}>
            <Animated.Text style={styles.infoTitle}>
              COMMENT ÇA MARCHE ?
            </Animated.Text>
            
            <View style={styles.infoItem}>
              <Animated.Text style={styles.infoBullet}>•</Animated.Text>
              <Animated.Text style={styles.infoText}>
                Analyse des sources publiques en ligne
              </Animated.Text>
            </View>
            
            <View style={styles.infoItem}>
              <Animated.Text style={styles.infoBullet}>•</Animated.Text>
              <Animated.Text style={styles.infoText}>
                IA identifie dramas et actions positives
              </Animated.Text>
            </View>
            
            <View style={styles.infoItem}>
              <Animated.Text style={styles.infoBullet}>•</Animated.Text>
              <Animated.Text style={styles.infoText}>
                Score de confiance calculé (0-100%)
              </Animated.Text>
            </View>
            
            <View style={styles.infoItem}>
              <Animated.Text style={styles.infoBullet}>•</Animated.Text>
              <Animated.Text style={styles.infoText}>
                Toutes les sources sont vérifiables
              </Animated.Text>
            </View>
          </View>
        </FadeInView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray400,
    marginBottom: SPACING['2xl'],
    lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.relaxed,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray800,
  },
  searchButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.gray800,
  },
  searchButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.black,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  loadingSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray500,
  },
  infoSection: {
    marginTop: SPACING.xl,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  infoBullet: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray600,
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.gray400,
    lineHeight: TYPOGRAPHY.fontSize.base * TYPOGRAPHY.lineHeight.relaxed,
  },
});
