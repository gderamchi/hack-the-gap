import React from 'react';
import { View, StyleSheet, Animated, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/designSystem';

interface AnimatedHeaderProps {
  title: string;
  scrollY: Animated.Value;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  scrollY,
  onBackPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animated values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Background with opacity fade */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      
      <View style={styles.headerContent}>
        {onBackPress && (
          <Animated.View style={styles.backButton}>
            {/* Back button would go here */}
          </Animated.View>
        )}
        
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY },
              ],
            },
          ]}
        >
          {title.toUpperCase()}
        </Animated.Text>
        
        {rightAction && (
          <View style={styles.rightAction}>{rightAction}</View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    color: COLORS.black,
  },
  rightAction: {
    position: 'absolute',
    right: SPACING.md,
  },
});
