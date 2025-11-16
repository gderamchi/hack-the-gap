import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (influencerId: string) => {
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(influencerId)) {
      newFavorites.delete(influencerId);
    } else {
      newFavorites.add(influencerId);
    }
    
    setFavorites(newFavorites);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
  };

  const isFavorite = (influencerId: string): boolean => {
    return favorites.has(influencerId);
  };

  const getFavorites = (): string[] => {
    return Array.from(favorites);
  };

  return {
    toggleFavorite,
    isFavorite,
    getFavorites,
    favoritesCount: favorites.size,
    loading,
  };
};
