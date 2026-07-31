import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

const farmLinkLogo = require('../../assets/images/icon.png');

export default function PhoneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleContinue = async () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    router.push({ pathname: '/auth/otp', params: { phone: phone.replace(/\D/g, '') } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image source={farmLinkLogo} style={styles.logoImg} contentFit="contain" />
          <Text style={[styles.brand, { color: colors.foreground }]}>FarmLink</Text>
        </View>

        {/* Hero text */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Farm fresh.{'\n'}Farmer first.
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Direct farmer payments, nearby Fresh Stations, and home delivery when you need it.
          </Text>
        </View>

        {/* Phone form */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>
            Enter your mobile number
          </Text>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={[
              styles.inputRow,
              {
                borderColor: isValid ? colors.primary : colors.border,
                backgroundColor: colors.card,
                borderWidth: isValid ? 2 : 1,
              },
            ]}
          >
            <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={[styles.code, { color: colors.foreground }]}>+91</Text>
            </View>
            <TextInput
              ref={inputRef}
              style={[styles.phoneInput, { color: colors.foreground }]}
              placeholder="00000 00000"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              autoFocus
              onSubmitEditing={handleContinue}
            />
            {isValid && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isValid ? colors.primary : colors.muted }]}
            onPress={handleContinue}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { color: isValid ? '#fff' : colors.mutedForeground }]}>
              {loading ? 'Sending OTP…' : 'Continue'}
            </Text>
            {!loading && (
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={isValid ? '#fff' : colors.mutedForeground}
              />
            )}
          </TouchableOpacity>

          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>

        {/* Trust pills */}
        <View style={styles.pills}>
          {['🌾 Zero commission', '🏧 Fresh Stations', '🌿 FarmPass delivery'].map((t) => (
            <View key={t} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.pillText, { color: colors.mutedForeground }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoImg: { width: 44, height: 44, borderRadius: 13 },
  brand: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  hero: { marginBottom: 36 },
  heroTitle: { fontSize: 36, fontFamily: 'Inter_700Bold', lineHeight: 44, marginBottom: 10 },
  heroSub: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  formSection: { gap: 12 },
  formLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  flag: { fontSize: 18 },
  code: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: 14,
    paddingVertical: 14,
    letterSpacing: 2,
  },
  checkIcon: { marginRight: 14 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  terms: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 28 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
