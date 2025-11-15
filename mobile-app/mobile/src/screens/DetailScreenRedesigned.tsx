import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Mention } from '../types';
import { influencerApi } from '../services/api';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { FadeInView } from '../components/FadeInView';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, getTrustScoreColor } from '../constants/designSystem';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export const DetailScreenRedesigned: React.FC<Props> = ({ route, navigation }) => {
  const { influencerId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { data: influencer, isLoading } = useQuery({
    queryKey: ['influencer', influencerId],
    queryFn: () => influencerApi.getById(influencerId),
  });
  
  if (isLoading || !influencer) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Animated.Text style={styles.loadingText}>CHARGEMENT...</Animated.Text>
      </View>
    );
  }
  
  // Parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100, HEADER_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const dramaCount = influencer.mentions?.filter((m: Mention) => m.label === 'drama').length || 0;
  const goodCount = influencer.mentions?.filter((m: Mention) => m.label === 'good_action').length || 0;
  const neutralCount = influencer.mentions?.filter((m: Mention) => m.label === 'neutral').length || 0;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Header with Back Button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Animated.Text style={styles.backIcon}>←</Animated.Text>
        </TouchableOpacity>
        
        <Animated.Text
          style={[
            styles.headerTitleText,
            { opacity: titleOpacity },
          ]}
        >
          {influencer.name.toUpperCase()}
        </Animated.Text>
      </View>
      
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Parallax */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            },
          ]}
        >
          <Image
            source={{
              uri: influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=800&background=000&color=fff&bold=true`,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          />
          
          {/* Hero Content */}
          <View style={styles.heroContent}>
            <FadeInView delay={0}>
              <Animated.Text style={styles.heroName}>
                {influencer.name.toUpperCase()}
              </Animated.Text>
            </FadeInView>
            
            {influencer.niche && (
              <FadeInView delay={100}>
                <Animated.Text style={styles.heroNiche}>
                  {influencer.niche.toUpperCase()}
                </Animated.Text>
              </FadeInView>
            )}
          </View>
        </Animated.View>
        
        {/* Trust Score Section */}
        <View style={styles.scoreSection}>
          <FadeInView delay={200}>
            <View style={styles.scoreBadgeContainer}>
              <TrustScoreBadge score={influencer.trustScore} size="large" />
            </View>
          </FadeInView>
        </View>
        
        {/* Stats Section */}
        <View style={styles.section}>
          <FadeInView delay={300}>
            <Animated.Text style={styles.sectionTitle}>
              STATISTIQUES
            </Animated.Text>
          </FadeInView>
          
          <View style={styles.statsGrid}>
            <FadeInView delay={350}>
              <View style={styles.statCard}>
                <Animated.Text style={styles.statCardValue}>
                  {dramaCount}
                </Animated.Text>
                <Animated.Text style={styles.statCardLabel}>
                  DRAMAS
                </Animated.Text>
              </View>
            </FadeInView>
            
            <FadeInView delay={400}>
              <View style={styles.statCard}>
                <Animated.Text style={styles.statCardValue}>
                  {goodCount}
                </Animated.Text>
                <Animated.Text style={styles.statCardLabel}>
                  ACTIONS POSITIVES
                </Animated.Text>
              </View>
            </FadeInView>
            
            <FadeInView delay={450}>
              <View style={styles.statCard}>
                <Animated.Text style={styles.statCardValue}>
                  {neutralCount}
                </Animated.Text>
                <Animated.Text style={styles.statCardLabel}>
                  NEUTRES
                </Animated.Text>
              </View>
            </FadeInView>
          </View>
        </View>
        
        {/* Mentions Section */}
        {influencer.mentions && influencer.mentions.length > 0 && (
          <View style={styles.section}>
            <FadeInView delay={500}>
              <Animated.Text style={styles.sectionTitle}>
                MENTIONS IA
              </Animated.Text>
            </FadeInView>
            
            {influencer.mentions.slice(0, 10).map((mention: Mention, index: number) => (
              <FadeInView key={mention.id} delay={550 + (index * 50)}>
                <View style={styles.mentionCard}>
                  <View style={[styles.mentionIndicator, { backgroundColor: getMentionColor(mention.label) }]} />
                  <View style={styles.mentionContent}>
                    <Animated.Text style={styles.mentionLabel}>
                      {mention.label.toUpperCase().replace('_', ' ')}
                    </Animated.Text>
                    <Animated.Text style={styles.mentionText} numberOfLines={3}>
                      {mention.textExcerpt}
                    </Animated.Text>
                    <Animated.Text style={styles.mentionSource}>
                      {mention.source}
                    </Animated.Text>
                  </View>
                </View>
              </FadeInView>
            ))}
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={{ height: SPACING['4xl'] }} />
      </Animated.ScrollView>
    </View>
  );
};

function getMentionColor(label: string): string {
  if (label === 'drama') return COLORS.trustPoor;
  if (label === 'good_action') return COLORS.trustExcellent;
  return COLORS.gray500;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerTitleText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    textAlign: 'center',
    marginRight: 44,
  },
  heroContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray900,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
  },
  heroName: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  heroNiche: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray300,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  scoreSection: {
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  scoreBadgeContainer: {
    // TrustScoreBadge handles its own styling
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.black,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.gray900,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statCardLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    textAlign: 'center',
  },
  mentionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  mentionIndicator: {
    width: 4,
  },
  mentionContent: {
    flex: 1,
    padding: SPACING.md,
  },
  mentionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.black,
    color: COLORS.gray500,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.xs,
  },
  mentionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.white,
    lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.sm,
  },
  mentionSource: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray600,
  },
});
