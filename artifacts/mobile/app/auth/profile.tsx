import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  subtitle: string;
  color: string;
}[] = [
  { role: 'consumer', emoji: '🛒', title: 'Buy Fresh', subtitle: 'Shop from local farms', color: '#2563EB' },
  { role: 'farmer', emoji: '🌾', title: 'Sell Produce', subtitle: 'List what you grow', color: '#1B8A3C' },
  { role: 'rider', emoji: '🏍️', title: 'Deliver It', subtitle: 'Earn per trip', color: '#7C3AED' },
];

const VEHICLES: { type: VehicleType; label: string; emoji: string }[] = [
  { type: 'bike', label: 'Bike / Scooty', emoji: '🏍️' },
  { type: 'auto', label: 'Auto Rickshaw', emoji: '🛺' },
  { type: 'cab', label: 'Car / Cab', emoji: '🚗' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setupUser } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const isRider = selectedRole === 'rider';
  const isFarmer = selectedRole === 'farmer';
  const canContinue = selectedRole !== null && name.trim().length > 0;
  const roleColor = ROLES.find((r) => r.role === selectedRole)?.color ?? colors.primary;

  const handleContinue = async () => {
    if (!canContinue || !selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isRider) {
      router.push({
        pathname: '/auth/rider-id',
        params: { phone, role: selectedRole, name: name.trim(), location: location.trim(), vehicleType },
      });
      return;
    }

    setLoading(true);
    await setupUser({
      name: name.trim(),
      phone: `+91 ${phone?.slice(0, 5)} ${phone?.slice(5)}`,
      role: selectedRole,
      location: location.trim() || (isFarmer ? 'East Godavari, AP' : undefined),
      idVerified: false,
    });

    if (isFarmer) router.replace('/(farmer)' as any);
    else router.replace('/(tabs)' as any);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Join FarmLink 🌱</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Pick your role and tell us a bit about yourself
        </Text>

        {/* Role chips */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>I want to...</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <TouchableOpacity
                key={r.role}
                style={[
                  styles.roleChip,
                  {
                    flex: 1,
                    backgroundColor: isSelected ? r.color + '15' : colors.card,
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
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleTitle, { color: isSelected ? r.color : colors.foreground }]}>
                  {r.title}
                </Text>
                <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>{r.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rider safety note */}
        {isRider && (
          <View
            style={[
              styles.riderNote,
              { backgroundColor: colors.riderColor + '0D', borderColor: colors.riderColor + '35' },
            ]}
          >
            <Text style={[styles.riderNoteTitle, { color: colors.riderColor }]}>
              🛡️ Quick safety check ahead
            </Text>
            <Text style={[styles.riderNoteBody, { color: colors.mutedForeground }]}>
              Every delivery partner does a one-time ID check before their first trip. This keeps farmers,
              families, and you safe — no fake accounts, no stolen deliveries. Your documents are encrypted
              and never shared with anyone. 🔒
            </Text>
          </View>
        )}

        {/* Profile fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Your Name *</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {isFarmer ? '🌾 Farm Location' : '📍 Your Area / City'}
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
              ]}
              placeholder={isFarmer ? 'e.g. Razole, East Godavari' : 'e.g. Kakinada, East Godavari'}
              placeholderTextColor={colors.mutedForeground}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {isRider && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>🚗 Your Vehicle</Text>
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
                          backgroundColor: isSelected ? colors.riderColor + '12' : colors.card,
                          borderColor: isSelected ? colors.riderColor : colors.border,
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
                      <Text
                        style={[
                          styles.vehicleLabel,
                          { color: isSelected ? colors.riderColor : colors.foreground },
                        ]}
                      >
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {!isRider && selectedRole && (
            <View style={[styles.privacyCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.primary} />
              <Text style={[styles.privacyText, { color: colors.primary }]}>
                🔐 Your number is verified. FarmLink never shares your details with anyone.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canContinue ? roleColor : colors.muted }]}
          onPress={handleContinue}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: canContinue ? '#fff' : colors.mutedForeground }]}>
            {loading
              ? 'Setting up... ⏳'
              : isRider
                ? 'Continue to Safety Check 🛡️'
                : 'Get Started 🚀'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.switchNote, { color: colors.mutedForeground }]}>
          💡 You can switch roles anytime from your profile
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 4,
  },
  roleEmoji: { fontSize: 26, marginBottom: 2 },
  roleTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  roleSub: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 14 },
  riderNote: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    marginBottom: 16,
  },
  riderNoteTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  riderNoteBody: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  form: { gap: 16, marginBottom: 24 },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  vehicleRow: { flexDirection: 'row', gap: 10 },
  vehicleChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  vehicleEmoji: { fontSize: 22 },
  vehicleLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  btn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  switchNote: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
