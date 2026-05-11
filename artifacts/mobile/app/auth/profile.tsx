import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [name, setName] = useState('');

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const maskedPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';
  const canContinue = name.trim().length >= 2;

  const handleContinue = () => {
    if (!canContinue) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/auth/role', params: { phone, name: name.trim() } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.inner, { paddingTop: topPad + 24, paddingBottom: bottomPad + 32 }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Text style={styles.iconEmoji}>👋</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>What's your name?</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Verified as{' '}
          <Text style={[styles.phoneHighlight, { color: colors.foreground }]}>{maskedPhone}</Text>
        </Text>

        <TextInput
          style={[
            styles.input,
            { borderColor: canContinue ? colors.primary : colors.border, backgroundColor: colors.card, color: colors.foreground },
          ]}
          placeholder="Enter your full name"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <View style={[styles.note, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.primary }]}>
            Your number is verified. FarmLink never shares your details.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canContinue ? colors.primary : colors.muted }]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: canContinue ? '#fff' : colors.mutedForeground }]}>
            Continue
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={canContinue ? '#fff' : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, gap: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  iconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  iconEmoji: { fontSize: 32 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginTop: 4 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  phoneHighlight: { fontFamily: 'Inter_600SemiBold' },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
