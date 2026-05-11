import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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

const farmLinkLogo = require('../assets/images/icon.png');

type Step = 'role' | 'profile';

const ROLES: { role: UserRole; title: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  {
    role: 'farmer',
    title: 'Farmer',
    description: 'List your fresh produce directly and connect with buyers near you',
    icon: 'tractor',
    color: '#1B8A3C',
  },
  {
    role: 'consumer',
    title: 'Consumer',
    description: 'Buy fresh farm produce directly — no middlemen, no markups',
    icon: 'shopping-outline',
    color: '#2563EB',
  },
  {
    role: 'rider',
    title: 'Delivery Rider',
    description: 'Pick up and deliver fresh orders with your own vehicle, earn per trip',
    icon: 'motorbike',
    color: '#7C3AED',
  },
];

const VEHICLES: { type: VehicleType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { type: 'bike', label: 'Bike', icon: 'motorbike' },
  { type: 'auto', label: 'Auto', icon: 'rickshaw' },
  { type: 'cab', label: 'Cab', icon: 'car' },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setupUser } = useApp();

  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [loading, setLoading] = useState(false);

  const selectRole = (role: UserRole) => {
    Haptics.selectionAsync();
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('profile');
  };

  const handleGetStarted = async () => {
    if (!name.trim() || !phone.trim() || !selectedRole) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setupUser({
      name: name.trim(),
      phone: phone.trim(),
      role: selectedRole,
      location: location.trim() || undefined,
      vehicleType: selectedRole === 'rider' ? vehicleType : undefined,
      idVerified: false,
    });
    if (selectedRole === 'farmer') router.replace('/(farmer)' as any);
    else if (selectedRole === 'rider') router.replace('/(rider)' as any);
    else router.replace('/(tabs)' as any);
    setLoading(false);
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={farmLinkLogo} style={styles.logoImg} contentFit="contain" />
          <Text style={[styles.brand, { color: colors.foreground }]}>FarmLink</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Farm to your door, fresh and fair
          </Text>
        </View>

        {step === 'role' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Who are you?</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Choose your role to get started
            </Text>

            <View style={styles.roles}>
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <TouchableOpacity
                    key={r.role}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: isSelected ? r.color + '12' : colors.card,
                        borderColor: isSelected ? r.color : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => selectRole(r.role)}
                  >
                    <View style={[styles.roleIcon, { backgroundColor: r.color + '20' }]}>
                      <MaterialCommunityIcons name={r.icon} size={28} color={r.color} />
                    </View>
                    <View style={styles.roleText}>
                      <Text style={[styles.roleTitle, { color: colors.foreground }]}>{r.title}</Text>
                      <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                        {r.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={20} color={r.color} style={styles.check} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.cta,
                { backgroundColor: selectedRole ? colors.primary : colors.muted },
              ]}
              onPress={handleContinue}
              disabled={!selectedRole}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: selectedRole ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity style={styles.back} onPress={() => setStep('role')}>
              <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
              <Text style={[styles.backText, { color: colors.mutedForeground }]}>Back</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your details</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Quick setup — takes 30 seconds
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Mobile Number</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  {selectedRole === 'farmer' ? 'Farm Location' : 'Your City'}
                </Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  placeholder={selectedRole === 'farmer' ? 'e.g. Nashik, Maharashtra' : 'e.g. Pune, Maharashtra'}
                  placeholderTextColor={colors.mutedForeground}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {selectedRole === 'rider' && (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Vehicle Type</Text>
                  <View style={styles.vehicles}>
                    {VEHICLES.map((v) => {
                      const isSelected = vehicleType === v.type;
                      return (
                        <TouchableOpacity
                          key={v.type}
                          style={[
                            styles.vehicleChip,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.card,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setVehicleType(v.type)}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name={v.icon}
                            size={18}
                            color={isSelected ? '#fff' : colors.mutedForeground}
                          />
                          <Text
                            style={[
                              styles.vehicleLabel,
                              { color: isSelected ? '#fff' : colors.mutedForeground },
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
            </View>

            <TouchableOpacity
              style={[
                styles.cta,
                { backgroundColor: name.trim() && phone.trim() ? colors.primary : colors.muted },
              ]}
              onPress={handleGetStarted}
              disabled={!name.trim() || !phone.trim() || loading}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: name.trim() && phone.trim() ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 36 },
  logoImg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    marginBottom: 14,
  },
  brand: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  section: { gap: 0 },
  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  sectionSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  roles: { gap: 12, marginBottom: 28 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleText: { flex: 1 },
  roleTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  roleDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  check: { marginLeft: 4, flexShrink: 0 },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  form: { gap: 16, marginBottom: 28 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  vehicles: { flexDirection: 'row', gap: 10 },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  vehicleLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
