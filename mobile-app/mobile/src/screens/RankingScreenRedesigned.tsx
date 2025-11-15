import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, RefreshControl, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Influencer } from '../types';
import { influencerApi } from '../services/api';
import { InfluencerCardRedesigned } from '../components/InfluencerCardRedesigned';
import { HorizontalCarousel } from '../components/HorizontalCarousel';
import { PillFilters } from '../components/PillFilters';
import { FadeInView } from '../components/FadeInView';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/designSystem';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

const CATEGORIES = [
  { id: 'all', label: 'Tous', value: undefined },
  { id: 'gaming', label: 'Gaming', value: 'Gaming' },
  { id: 'beauty', label: 'Beauty', value: 'Beauty' },
  { id: 'lifestyle', label: 'Lifestyle', value: 'Lifestyle' },
  { id: 'fitness', label: 'Fitness', value: 'Fitness' },
  { id: 'comedy', label: 'Comedy', value: 'Comedy' },
  { id: 'tech', label: 'Tech', value: 'Tech' },
  { id: 'cooking', label: 'Cooking', value: 'Cooking' },
  { id: 'music', label: 'Music', value: 'Music' },
  { id: 'fashion', label: 'Fashion', value: 'Fashion' },
];

const TRUST_FILTERS = [
  { id: 'all', label: 'Tous', value: undefined },
  { id: '80', label: '80%+', value: 80 },
  { id: '60', label: '60%+', value: 60 },
  { id: '40', label: '40%+', value: 40 },
];

export const RankingScreenRedesigned: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrustFilter, setSelectedTrustFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const currentTrustFilter = TRUST_FILTERS.find(f => f.id === selectedTrustFilter)?.value;
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory)?.value;
  
  const { data: influencers, isLoading, refetch } = useQuery({
    queryKey: ['influencers', currentTrustFilter, currentCategory, searchQuery],
    queryFn: () => influencerApi.getAll({
      minTrustScore: currentTrustFilter,
      niche: currentCategory,
      limit: 1000,
      search: searchQuery || undefined,
    }),
  });
  
  const handleInfluencerPress = (influencer: Influencer) => {
    navigation.navigate('Detail', { influencerId: influencer.id });
  };
  
  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
  };
  
  const handleTrustFilterSelect = (id: string) => {
    setSelectedTrustFilter(id);
  };
  
  // Animated header values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.95],
    extrapolate: 'clamp',
  });
  
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
          },
        ]}
      >
        <Animated.Text style={styles.headerTitle}>
          TRUST RANKINGS
        </Animated.Text>
      </Animated.View>
      
      <Animated.FlatList
        data={influencers}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Hero Section */}
            <Animated.View
              style={[
                styles.hero,
                {
                  transform: [
                    { scale: heroScale },
                    { translateY: heroTranslateY },
                  ],
                },
              ]}
            >
              <View style={styles.heroOverlay}>
                <FadeInView delay={0}>
                  <Animated.Text style={styles.heroTitle}>
                    DÉCOUVREZ
                  </Animated.Text>
                </FadeInView>
                <FadeInView delay={100}>
                  <Animated.Text style={styles.heroSubtitle}>
                    Les influenceurs les plus fiables
                  </Animated.Text>
                </FadeInView>
                <FadeInView delay={200}>
                  <View style={styles.heroStats}>
                    <View style={styles.heroStat}>
                      <Animated.Text style={styles.heroStatValue}>
                        {influencers?.length || 0}
                      </Animated.Text>
                      <Animated.Text style={styles.heroStatLabel}>
                        INFLUENCEURS
                      </Animated.Text>
                    </View>
                    <View style={styles.heroStatDivider} />
                    <View style={styles.heroStat}>
                      <Animated.Text style={styles.heroStatValue}>
                        {influencers && influencers.length > 0
                          ? Math.round(influencers.reduce((sum, inf) => sum + inf.trustScore, 0) / influencers.length)
                          : 0}%
                      </Animated.Text>
                      <Animated.Text style={styles.heroStatLabel}>
                        SCORE MOYEN
                      </Animated.Text>
                    </View>
                  </View>
                </FadeInView>
              </View>
            </Animated.View>
            
            {/* Category Carousel */}
            <FadeInView delay={300}>
              <HorizontalCarousel
                items={CATEGORIES}
                selectedId={selectedCategory}
                onSelect={handleCategorySelect}
              />
            </FadeInView>
            
            {/* Trust Score Filters */}
            <FadeInView delay={400}>
              <View style={styles.filterSection}>
                <Animated.Text style={styles.sectionTitle}>
                  SCORE DE CONFIANCE
                </Animated.Text>
                <PillFilters
                  options={TRUST_FILTERS}
                  selectedId={selectedTrustFilter}
                  onSelect={handleTrustFilterSelect}
                />
              </View>
            </FadeInView>
            
            {/* Results Header */}
            {influencers && influencers.length > 0 && (
              <FadeInView delay={500}>
                <View style={styles.resultsHeader}>
                  <Animated.Text style={styles.resultsTitle}>
                    CLASSEMENT
                  </Animated.Text>
                  <Animated.Text style={styles.resultsCount}>
                    {influencers.length} résultats
                  </Animated.Text>
                </View>
              </FadeInView>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <FadeInView delay={600 + (index * 50)} key={item.id}>
            <InfluencerCardRedesigned
              influencer={item}
              onPress={() => handleInfluencerPress(item)}
              index={index}
            />
          </FadeInView>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={COLORS.white}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Animated.Text style={styles.emptyText}>
              AUCUN RÉSULTAT
            </Animated.Text>
            <Animated.Text style={styles.emptySubtext}>
              Essayez de modifier vos filtres
            </Animated.Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.black,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textAlign: 'center',
  },
  hero: {
    height: 320,
    backgroundColor: COLORS.gray900,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    padding: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray300,
    marginBottom: SPACING.xl,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  heroStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray700,
    marginHorizontal: SPACING.lg,
  },
  filterSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray500,
  },
  listContent: {
    paddingBottom: SPACING['3xl'],
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
