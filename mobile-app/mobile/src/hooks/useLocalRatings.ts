import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATINGS_KEY = '@user_ratings';

interface Rating {
  influencerId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: number;
}

export const useLocalRatings = () => {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const stored = await AsyncStorage.getItem(RATINGS_KEY);
      if (stored) {
        setRatings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRating = async (influencerId: string, rating: number, comment?: string) => {
    const newRating: Rating = {
      influencerId,
      rating,
      comment,
      timestamp: Date.now(),
    };

    const updated = {
      ...ratings,
      [influencerId]: newRating,
    };

    setRatings(updated);
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
  };

  const getRating = (influencerId: string): Rating | null => {
    return ratings[influencerId] || null;
  };

  const getAllRatings = (): Rating[] => {
    return Object.values(ratings);
  };

  const deleteRating = async (influencerId: string) => {
    const updated = { ...ratings };
    delete updated[influencerId];
    
    setRatings(updated);
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
  };

  return {
    saveRating,
    getRating,
    getAllRatings,
    deleteRating,
    loading,
  };
};
