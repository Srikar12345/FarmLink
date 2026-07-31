import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const BENEFITS = [
  { emoji: '🚴', text: 'Free home delivery on eligible orders of ₹199 or more' },
  { emoji: '🏧', text: 'Free Fresh Station pickup always — no membership needed' },
  { emoji: '⚡', text: 'Priority order matching — riders reach you first' },
  { emoji: '🌿', text: 'Eco-packaging deposit waived on first order each month' },
  { emoji: '🔔', text: 'Early alerts when fresh harvests arrive near you' },
  { emoji: '📊', text: 'Monthly savings report — see exactly how much you saved' },
];

export default function FarmPassScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, activateFarmPass } = useApp();
  const [activating, setActivating] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const isActive = currentUser?.hasFarmPass;

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActivating(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate payment
    await activateFarmPass(plan);
    setActivating(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🌿 FarmPass Active!',
      `Your ${plan === 'monthly' ? '₹49/month' : '₹499/year'} FarmPass is now active. Eligible ₹199+ home orders now have ₹0 delivery.`,
      [{ text: 'Start Shopping 🛒', onPress: () => router.replace('/(tabs)' as any) }],
    );
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '30' }]}>
        <Text style={styles.heroEmoji}>🌿</Text>
        <Text style={[styles.heroTitle, { color: colors.freshGreen }]}>FarmPass</Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Delivery value that keeps farmers paid and riders earning.
        </Text>
        {isActive && (
          <View style={[styles.activeBadge, { backgroundColor: colors.freshGreen }]}>
            <MaterialCommunityIcons name="check-circle" size={14} color="#fff" />
            <Text style={styles.activeBadgeText}>Active on your account</Text>
          </View>
        )}
      </View>

      {/* Delivery cost context */}
      <View style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.contextTitle, { color: colors.foreground }]}>Why a delivery fee exists</Text>
        <Text style={[styles.contextText, { color: colors.mutedForeground }]}>
          Farmers always receive 100% of the produce price. A ₹30–50 delivery fee supports local riders and operations.
          FarmPass spreads that cost across members, so eligible ₹199+ home orders have ₹0 delivery while riders still earn.
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What you get</Text>
        <View style={[styles.benefitsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefitRow, i < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={styles.benefitEmoji}>{b.emoji}</Text>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Savings estimate */}
      <View style={[styles.savingsCard, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '30' }]}>
        <MaterialCommunityIcons name="calculator-variant-outline" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.savingsTitle, { color: colors.primary }]}>Your estimated savings</Text>
          <Text style={[styles.savingsText, { color: colors.mutedForeground }]}>
            If you order 3× a week (avg ₹40 delivery each), you spend ₹480/month on delivery fees.
            FarmPass costs ₹49. You save ₹431 every month. 💰
          </Text>
        </View>
      </View>

      {!isActive && (
        <View style={styles.plans}>
          {/* Yearly — highlighted */}
          <TouchableOpacity
            style={[styles.planCard, styles.planCardBest, { borderColor: colors.primary, backgroundColor: colors.primary }]}
            onPress={() => handleSubscribe('yearly')}
            disabled={activating}
            activeOpacity={0.85}
          >
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>⭐ BEST VALUE</Text>
            </View>
            <Text style={styles.planPriceWhite}>₹499</Text>
            <Text style={styles.planPeriodWhite}>/year</Text>
            <Text style={styles.planSave}>Save ₹89 vs monthly</Text>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.planCard, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => handleSubscribe('monthly')}
            disabled={activating}
            activeOpacity={0.85}
          >
            <Text style={[styles.planPrice, { color: colors.foreground }]}>₹49</Text>
            <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>/month</Text>
            <Text style={[styles.planNote, { color: colors.mutedForeground }]}>Cancel anytime</Text>
          </TouchableOpacity>
        </View>
      )}

      {isActive && (
        <View style={[styles.activeCard, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40' }]}>
          <MaterialCommunityIcons name="check-decagram" size={24} color={colors.freshGreen} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeTitle, { color: colors.freshGreen }]}>FarmPass is active!</Text>
            <Text style={[styles.activeText, { color: colors.mutedForeground }]}>
              Eligible ₹199+ home orders have ₹0 delivery. Fresh Station pickup is always free. 🎉
            </Text>
          </View>
        </View>
      )}

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Pilot mode: activation is instant for testing. Before launch, connect a subscription payment provider so every membership charge is verified.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  hero: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  heroSub: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  activeBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  contextCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  contextTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  contextText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  benefitsList: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  benefitEmoji: { fontSize: 22, width: 30 },
  benefitText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 20 },
  savingsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  savingsTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  savingsText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  plans: { flexDirection: 'row', gap: 12 },
  planCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  planCardBest: { position: 'relative' },
  bestBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bestBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  planPriceWhite: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  planPeriodWhite: { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.8)' },
  planSave: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  planPrice: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  planPeriod: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  planNote: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  activeText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  footer: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 17 },
});
