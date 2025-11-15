import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/designSystem';

interface FilterOption {
  id: string;
  label: string;
  value: any;
}

interface PillFiltersProps {
  options: FilterOption[];
  selectedId?: string;
  onSelect: (id: string, value: any) => void;
}

export const PillFilters: React.FC<PillFiltersProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <PillFilter
          key={option.id}
          option={option}
          isSelected={option.id === selectedId}
          onPress={() => onSelect(option.id, option.value)}
        />
      ))}
    </View>
  );
};

interface PillFilterProps {
  option: FilterOption;
  isSelected: boolean;
  onPress: () => void;
}

const PillFilter: React.FC<PillFilterProps> = ({ option, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
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
          styles.pill,
          isSelected && styles.pillSelected,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.pillText,
            isSelected && styles.pillTextSelected,
          ]}
        >
          {option.label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  pillSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  pillText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray700,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  pillTextSelected: {
    color: COLORS.white,
  },
});
