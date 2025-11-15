import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/designSystem';

interface CarouselItem {
  id: string;
  label: string;
  count?: number;
}

interface HorizontalCarouselProps {
  items: CarouselItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  items,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={120}
      >
        {items.map((item, index) => (
          <CarouselChip
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            onPress={() => onSelect(item.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface CarouselChipProps {
  item: CarouselItem;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const CarouselChip: React.FC<CarouselChipProps> = ({ item, isSelected, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected,
          ]}
        >
          {item.label.toUpperCase()}
        </Animated.Text>
        {item.count !== undefined && (
          <Animated.Text
            style={[
              styles.chipCount,
              isSelected && styles.chipCountSelected,
            ]}
          >
            {item.count}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chipSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.black,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  chipCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray500,
  },
  chipCountSelected: {
    color: COLORS.gray400,
  },
});
