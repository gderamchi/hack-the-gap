import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Appbar, TextInput, Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { influencerApi } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  
  const searchMutation = useMutation({
    mutationFn: (influencerName: string) => influencerApi.search(influencerName, false),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      navigation.navigate('Detail', { influencerId: data.influencer.id });
    },
    onError: (err: any) => {
      setError(err.message || 'Erreur lors de la recherche');
    },
  });
  
  const handleSearch = () => {
    if (!name.trim()) {
      setError('Veuillez entrer un nom');
      return;
    }
    
    setError('');
    searchMutation.mutate(name.trim());
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Rechercher un influenceur" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.title}>
              Recherche d'influenceur
            </Text>
            
            <Text variant="bodyMedium" style={styles.description}>
              Entrez le nom d'un influenceur français pour analyser sa réputation en ligne.
            </Text>
            
            <TextInput
              label="Nom de l'influenceur"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Squeezie, Norman, Cyprien..."
              autoCapitalize="words"
              disabled={searchMutation.isPending}
            />
            
            {error && (
              <Text variant="bodySmall" style={styles.error}>
                {error}
              </Text>
            )}
            
            <Button
              mode="contained"
              onPress={handleSearch}
              loading={searchMutation.isPending}
              disabled={searchMutation.isPending}
              style={styles.button}
            >
              {searchMutation.isPending ? 'Recherche en cours...' : 'Rechercher'}
            </Button>
            
            {searchMutation.isPending && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Analyse en cours...
                </Text>
                <Text variant="bodySmall" style={styles.loadingSubtext}>
                  Cela peut prendre 30-60 secondes
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.infoTitle}>
              ℹ️ Comment ça marche ?
            </Text>
            
            <Text variant="bodySmall" style={styles.infoText}>
              • Nous analysons les sources publiques en ligne
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • L'IA identifie les dramas et actions positives
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Un score de confiance est calculé (0-100%)
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Toutes les sources sont vérifiables
            </Text>
          </Card.Content>
        </Card>
        
        <Text variant="bodySmall" style={styles.disclaimer}>
          ⚠️ Les résultats sont basés sur des sources publiques et peuvent être incomplets. Vérifiez toujours les sources avant de tirer des conclusions.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    marginBottom: 20,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: '#ef4444',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    marginTop: 4,
    opacity: 0.7,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 1,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    marginBottom: 6,
    opacity: 0.7,
  },
  disclaimer: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 16,
  },
});
