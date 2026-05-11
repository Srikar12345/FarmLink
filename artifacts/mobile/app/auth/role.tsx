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

import { useApp, type UserRole, type VehicleType } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const ROLES: {
  role: UserRole;
  emoji: string;
  title: string;
  desc: string;
  perks: string[];
  color: string;
}[] = [
  {
    role: 'consumer',
    emoji: '🛒',
    title: 'Buy Fresh',
    desc: 'Shop directly from local farms',
    perks: [
      'Up to 38% cheaper than Blinkit / BigBasket',
      'Same-day delivery from nearby farms',
      'See exactly where your food comes from',
    ],
    color: '#2563EB',
  },
  {
    role: 'farmer',
    emoji: '🌾',
    title: 'Sell Produce',
    desc: 'List what you grow, find direct buyers',
    perks: [
      'Set your own price — zero agent commission',
      'See live consumer demand before you plant',
      'Eco-packaging support — jute bags, glass jars',
    ],
    color: '#1B8A3C',
  },
  {
    role: 'rider',
    emoji: '🏍️',
    title: 'Deliver & Earn',
    desc: 'Pick up and deliver farm orders locally',
    perks: [
      'Earn ₹50–300 per delivery trip',
      'Flexible hours — deliver when you want',
      'Take earnings as cash or FarmLink credits',
    ],
    color: '#7C3AED',
  },
];

const VEHICLES: { type: VehicleType; label: string; emoji: string }[] = [
  { type: 'bike', label: 'Bike / Scooty', emoji: '🏍️' },
  { type: 'auto', label: 'Auto', emoji: '🛺' },
  { type: 'cab', label: 'Car', emoji: '🚗' },
];

export default function RoleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone, name } = useLocalSearchParams<{ phone: string; name: string }>();
  const { setupUser } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const isRider = selectedRole === 'rider';
  const roleColor = ROLES.find((r) => r.role === selectedRole)?.color ?? colors.primary;

  const handleStart = async () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const formattedPhone = `+91 ${phone?.slice(0, 5)} ${phone?.slice(5)}`;

    if (isRider) {
      router.push({
        pathname: '/auth/rider-id',
        params: { phone, role: 'rider', name, vehicleType },
      });
      return;
    }

    setLoading(true);
    await setupUser({
      name: name ?? '',
      phone: formattedPhone,
      role: selectedRole,
      location: selectedRole === 'farmer' ? 'East Godavari, AP' : undefined,
      idVerified: false,
    });

    if (selectedRole === 'farmer') router.replace('/(farmer)' as any);
    else router.replace('/(tabs)' as any);
    setLoading(false);
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

      <Text style={[styles.hello, { color: colors.mutedForeground }]}>Welcome, {name} 👋</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>How will you{'\n'}use FarmLink?</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Pick your role — you can switch anytime from within the app
      </Text>

      <View style={styles.cards}>
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.role;
          return (
            <TouchableOpacity
              key={r.role}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? r.color + '10' : colors.card,
                  borderColor: isSelected ? r.color : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedRole(r.role);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.emojiBox, { backgroundColor: r.color + '18' }]}>
                  <Text style={styles.emoji}>{r.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleTitle, { color: isSelected ? r.color : colors.foreground }]}>
                    {r.title}
                  </Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{r.desc}</Text>
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

              {isSelected && (
                <View style={[styles.perksBox, { borderTopColor: r.color + '25', borderTopWidth: 1 }]}>
                  {r.perks.map((p) => (
                    <View key={p} style={styles.perkRow}>
                      <MaterialCommunityIcons name="check-circle-outline" size={14} color={r.color} />
                      <Text style={[styles.perkText, { color: colors.mutedForeground }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isRider && (
        <View style={styles.vehicleSection}>
          <Text style={[styles.vehicleLabel, { color: colors.mutedForeground }]}>Your vehicle</Text>
          <View style={styles.vehicleRow}>
            {VEHICLES.map((v) => {
              const isSelected = vehicleType === v.type;
              return (
                <TouchableOpacity
                  key={v.type}
                  style={[
                    styles.vehicleChip,
                    {
                      flex: 1,
                      backgroundColor: isSelected ? '#7C3AED12' : colors.card,
                      borderColor: isSelected ? '#7C3AED' : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setVehicleType(v.type);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vehicleChipLabel, { color: isSelected ? '#7C3AED' : colors.foreground }]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.riderNote, { backgroundColor: '#7C3AED0D', borderColor: '#7C3AED35' }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={14} color="#7C3AED" />
            <Text style={[styles.riderNoteText, { color: '#7C3AED' }]}>
              A quick one-time ID check is required before your first delivery — keeps everyone safe.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: selectedRole ? roleColor : colors.muted }]}
        onPress={handleStart}
        disabled={!selectedRole || loading}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnText, { color: selectedRole ? '#fff' : colors.mutedForeground }]}>
          {loading ? 'Setting up...' : isRider ? 'Continue to ID Check 🛡️' : 'Get Started 🚀'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.switchNote, { color: colors.mutedForeground }]}>
        💡 You can switch roles anytime from the app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  hello: { fontSize: 14, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', lineHeight: 34, marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 20 },
  cards: { gap: 12, marginBottom: 16 },
  card: { borderRadius: 18, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  emojiBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  roleTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  roleDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perksBox: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 10, gap: 8 },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  perkText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
  vehicleSection: { gap: 10, marginBottom: 16 },
  vehicleLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  vehicleRow: { flexDirection: 'row', gap: 10 },
  vehicleChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  vehicleEmoji: { fontSize: 22 },
  vehicleChipLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  riderNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  riderNoteText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },
  btn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  switchNote: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
