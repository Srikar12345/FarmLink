import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { useColors } from '@/hooks/useColors';

interface FeedItem {
  id: string;
  icon: string;
  color: string;
  text: string;
  tag: string;
  listingId?: string;
}

const FEED_ITEMS: FeedItem[] = [
  { id: '1', icon: '🌾', color: '#B45309', text: 'Ravi Reddy just milled Sona Masuri · ₹52/kg · 500kg ready', tag: 'NEW', listingId: 'listing1' },
  { id: '2', icon: '🐟', color: '#0891B2', text: 'Godavari Tiger Prawns in stock · ₹380/kg · Fresh morning catch', tag: 'FRESH', listingId: 'listing5' },
  { id: '3', icon: '🥥', color: '#16A34A', text: 'Tender Coconuts from Kakinada · ₹30/piece · Order 10+ for free delivery', tag: 'OFFER', listingId: 'listing4' },
  { id: '4', icon: '🌿', color: '#7C3AED', text: 'Raw Turmeric Fingers available · ₹60/kg · High curcumin variety', tag: 'RARE', listingId: 'listing3' },
  { id: '5', icon: '🍌', color: '#D97706', text: 'Monthan Banana from Kovvur · ₹40/dozen · Perfect for bajji', tag: 'NEW', listingId: 'listing6' },
  { id: '6', icon: '🌾', color: '#B45309', text: 'BPT Boiled Rice · ₹48/kg · Save ₹24 vs BigBasket', tag: 'SAVE 33%', listingId: 'listing2' },
  { id: '7', icon: '📦', color: '#DC2626', text: 'Meena Catering needs curry leaves weekly · ₹120/kg · Pledge to grow', tag: 'DEMAND', },
  { id: '8', icon: '🏍️', color: '#7C3AED', text: '3 deliveries available near Kakinada · ₹150–220 per trip', tag: 'EARN', },
];

const TAG_COLORS: Record<string, string> = {
  NEW: '#16A34A',
  FRESH: '#0891B2',
  OFFER: '#D97706',
  RARE: '#7C3AED',
  'SAVE 33%': '#16A34A',
  DEMAND: '#DC2626',
  EARN: '#7C3AED',
};

export function LiveFeedBanner() {
  const colors = useColors();
  const [currentIdx, setCurrentIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -8, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 8, duration: 0, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setCurrentIdx((i) => (i + 1) % FEED_ITEMS.length);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    };

    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, []);

  const item = FEED_ITEMS[currentIdx];
  const tagColor = TAG_COLORS[item.tag] || colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        if (item.listingId) router.push(`/listing/${item.listingId}`);
      }}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.liveIndicator, { backgroundColor: '#DC2626' }]}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={[styles.text, { color: colors.foreground }]} numberOfLines={1}>
          {item.text}
        </Text>
        <View style={[styles.tag, { backgroundColor: tagColor + '18' }]}>
          <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
        </View>
      </Animated.View>

      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, overflow: 'hidden' },
  icon: { fontSize: 16, flexShrink: 0 },
  text: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, flexShrink: 0 },
  tagText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
});
