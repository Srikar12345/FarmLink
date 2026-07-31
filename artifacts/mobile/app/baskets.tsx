import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const BASKETS = [
  { name: 'Weekly Veggie Box', price: 349, icon: '🥬', desc: '7–9 seasonal vegetables selected by local demand', frequency: 'weekly' as const, items: 'Tomato · bhindi · gourds · leafy greens' },
  { name: 'Fresh Fruit Box', price: 429, icon: '🍌', desc: 'Family fruit essentials, harvested for this week', frequency: 'weekly' as const, items: 'Bananas · coconuts · seasonal fruit' },
  { name: 'Kitchen Staples', price: 899, icon: '🌾', desc: 'Rice, turmeric, coconut and pantry essentials', frequency: 'monthly' as const, items: 'Sona Masuri · BPT · turmeric · coconut' },
];

export default function BasketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, createSubscription, cancelSubscription } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.list, { paddingTop: topPad + 14, paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.foreground} /></TouchableOpacity>
          <View><Text style={[styles.title, { color: colors.foreground }]}>Freshness Plans</Text><Text style={[styles.sub, { color: colors.mutedForeground }]}>Demand-led baskets, packed for your local station</Text></View>
        </View>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Never overstock your kitchen.</Text>
          <Text style={styles.heroText}>A recurring basket lets FarmLink predict household demand, replenish machines every 6–12 hours, and help farmers harvest only what people will use.</Text>
        </View>
        <Text style={[styles.section, { color: colors.foreground }]}>Choose a recurring basket</Text>
        {BASKETS.map((basket) => {
          const active = subscriptions.find((subscription) => subscription.name === basket.name && subscription.status === 'active');
          return (
            <View key={basket.name} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.basketEmoji}>{basket.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.foreground }]}>{basket.name}</Text>
                <Text style={[styles.desc, { color: colors.mutedForeground }]}>{basket.desc}</Text>
                <Text style={[styles.items, { color: colors.primary }]}>{basket.items}</Text>
                <Text style={[styles.price, { color: colors.foreground }]}>₹{basket.price} <Text style={[styles.cycle, { color: colors.mutedForeground }]}>/{basket.frequency === 'weekly' ? 'week' : 'month'}</Text></Text>
              </View>
              <TouchableOpacity
                style={[styles.action, { backgroundColor: active ? '#FEE2E2' : colors.primary }]}
                onPress={() => active ? cancelSubscription(active.id) : createSubscription({ name: basket.name, frequency: basket.frequency, price: basket.price })}
              >
                <Text style={[styles.actionText, { color: active ? '#DC2626' : '#fff' }]}>{active ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {subscriptions.length > 0 && (
          <>
            <Text style={[styles.section, { color: colors.foreground }]}>Your plans</Text>
            {subscriptions.map((subscription) => (
              <View key={subscription.id} style={[styles.activePlan, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40' }]}>
                <MaterialCommunityIcons name="calendar-check-outline" size={20} color={colors.freshGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activeName, { color: colors.freshGreen }]}>{subscription.name} · {subscription.status}</Text>
                  <Text style={[styles.activeText, { color: colors.mutedForeground }]}>Next fresh pack: {new Date(subscription.nextDelivery).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, list: { paddingHorizontal: 16, gap: 14 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 }, title: { fontSize: 22, fontFamily: 'Inter_700Bold' }, sub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  hero: { backgroundColor: '#052E16', borderRadius: 18, padding: 17 }, heroTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#F0FDF4' }, heroText: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular', color: '#BBF7D0', marginTop: 6 },
  section: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 4 }, card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 13, borderRadius: 16 }, basketEmoji: { fontSize: 32 }, name: { fontSize: 14, fontFamily: 'Inter_700Bold' }, desc: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular', marginTop: 3 }, items: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 6 }, price: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 7 }, cycle: { fontSize: 10, fontFamily: 'Inter_400Regular' }, action: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10 }, actionText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  activePlan: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 13, borderRadius: 14 }, activeName: { fontSize: 13, fontFamily: 'Inter_700Bold' }, activeText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
});