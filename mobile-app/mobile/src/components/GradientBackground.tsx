import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/designSystem';

interface GradientBackgroundProps {
  variant?: 'dark' | 'hero' | 'trustExcellent' | 'trustGood' | 'trustNeutral' | 'trustPoor';
  children?: React.ReactNode;
}

const GRADIENT_PRESETS: Record<string, [string, string]> = {
  dark: [COLORS.gray900, COLORS.black],
  hero: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)'],
  trustExcellent: [COLORS.trustExcellent, '#059669'],
  trustGood: [COLORS.trustGood, '#2563EB'],
  trustNeutral: [COLORS.trustNeutral, '#D97706'],
  trustPoor: [COLORS.trustPoor, '#DC2626'],
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'dark',
  children,
}) => {
  return (
    <LinearGradient
      colors={GRADIENT_PRESETS[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
