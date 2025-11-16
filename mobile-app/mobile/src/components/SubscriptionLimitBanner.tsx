import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { engagementApi } from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export const SubscriptionLimitBanner: React.FC = () => {
  const { isAuthenticated } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSubscription = async () => {
    try {
      const data = await engagementApi.getMySubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading || !subscription) {
    return null;
  }

  // Don't show for unlimited tiers
  if (subscription.remaining === -1) {
    return null;
  }

  // Show warning if low on reports
  if (subscription.remaining <= 2 && subscription.remaining > 0) {
    return (
      <View style={[styles.banner, styles.warningBanner]}>
        <Text style={styles.bannerText}>
          ⚠️ {subscription.remaining} report{subscription.remaining > 1 ? 's' : ''} remaining this month
        </Text>
        <TouchableOpacity onPress={handleUpgrade}>
          <Text style={styles.upgradeLink}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show error if no reports left
  if (subscription.remaining === 0) {
    return (
      <View style={[styles.banner, styles.errorBanner]}>
        <Text style={styles.bannerText}>
          🚫 Monthly report limit reached ({subscription.monthlyReportsLimit})
        </Text>
        <TouchableOpacity onPress={handleUpgrade}>
          <Text style={styles.upgradeLink}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show info for free tier
  if (subscription.tier === 'FREE') {
    return (
      <View style={[styles.banner, styles.infoBanner]}>
        <Text style={styles.bannerText}>
          📊 {subscription.remaining}/{subscription.monthlyReportsLimit} reports remaining
        </Text>
        <TouchableOpacity onPress={handleUpgrade}>
          <Text style={styles.upgradeLink}>Get More</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const handleUpgrade = async () => {
  try {
    const pricing = await engagementApi.getPricing();
    
    Alert.alert(
      'Upgrade Subscription',
      `FREE: ${pricing.FREE.monthlyReports} reports/month\n\n` +
      `PREMIUM (€${pricing.PREMIUM.price}/month): ${pricing.PREMIUM.monthlyReports} reports/month\n\n` +
      `PROFESSIONAL (€${pricing.PROFESSIONAL.price}/month): Unlimited reports`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => {
          // TODO: Navigate to pricing screen or open payment flow
          Alert.alert('Coming Soon', 'Payment integration coming soon!');
        }},
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'Failed to load pricing');
  }
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  infoBanner: {
    backgroundColor: '#dbeafe',
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  upgradeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});
