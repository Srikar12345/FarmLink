import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import type { UserRole } from '@/context/AppContext';

const ROLES: {
  role: UserRole;
  emoji: string;
  title: string;
  subtitle: string;
  perks: string[];
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  {
    role: 'consumer',
    emoji: '🛒',
    title: 'Buy Fresh Produce',
    subtitle: 'For households, families, and salaried employees',
    perks: [
      'Up to 38% cheaper than Blinkit & BigBasket',
      'Compare live prices vs Zepto, Swiggy, JioMart',
      'Same-day delivery from nearby farms',
      'See exactly where your food comes from',
    ],
    color: '#2563EB',
    icon: 'shopping-outline',
  },
  {
    role: 'farmer',
    emoji: '🌾',
    title: 'Sell What I Grow',
    subtitle: 'For farmers in East Godavari and surrounding districts',
    perks: [
      'Set your own price — no agent commission',
      'Money directly in your hands, same day',
      'See what consumers near you are requesting',
      'Eco-packaging support — jute bags, glass jars',
    ],
    color: '#1B8A3C',
    icon: 'sprout',
  },
  {
    role: 'rider',
    emoji: '🏍️',
    title: 'Help Deliver It',
    subtitle: 'For anyone with a bike, auto or car',
    perks: [
      'Earn ₹50–300 per delivery trip',
      'Take earnings as cash — or apply as grocery discounts',
      'Reduce your own monthly food bill',
      'Deliver when you want — no fixed hours',
    ],
    color: '#7C3AED',
    icon: 'motorbike',
  },
];

export default function RoleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/auth/profile', params: { phone, role: selected } });
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground }]}>How will you use{'\n'}FarmLink?</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        You can always add another role later. Most people use more than one.
      </Text>

      <View style={styles.cards}>
        {ROLES.map((r) => {
          const isSelected = selected === r.role;
          return (
            <TouchableOpacity
              key={r.role}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? r.color + '0D' : colors.card,
                  borderColor: isSelected ? r.color : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelected(r.role);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: r.color + '18' }]}>
                  <Text style={styles.emoji}>{r.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{r.title}</Text>
                  <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{r.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? r.color : colors.border,
                      backgroundColor: isSelected ? r.color : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                </View>
              </View>

              <View style={styles.perks}>
                {r.perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <View style={[styles.perkDot, { backgroundColor: r.color }]} />
                    <Text style={[styles.perkText, { color: colors.mutedForeground }]}>{perk}</Text>
                  </View>
                ))}
              </View>

              {r.role === 'rider' && (
                <View style={[styles.riderNote, { backgroundColor: r.color + '0D', borderColor: r.color + '30' }]}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={r.color} />
                  <Text style={[styles.riderNoteText, { color: r.color }]}>
                    Government ID + selfie required for rider registration. Keeps our community safe.
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: selected ? colors.primary : colors.muted }]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnText, { color: selected ? '#fff' : colors.mutedForeground }]}>
          Continue
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color={selected ? '#fff' : colors.mutedForeground} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', lineHeight: 34, marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 24 },
  cards: { gap: 14, marginBottom: 24 },
  card: { borderRadius: 18, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji: { fontSize: 26 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  cardSub: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  perks: { gap: 6, paddingLeft: 4 },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  perkDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  perkText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
  riderNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  riderNoteText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 17 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
