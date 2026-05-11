import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const refs = [ref0, ref1, ref2, ref3];

  const topPad = Platform.OS === 'web' ? 80 : insets.top;

  useEffect(() => {
    refs[0].current?.focus();
    const t = setInterval(() => setResendTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < OTP_LENGTH - 1) {
      refs[idx + 1].current?.focus();
    }
    if (next.every((d) => d !== '') && digit) {
      verifyOtp(next.join(''));
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setVerifying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 900));
    // Any 4-digit code is accepted (demo mode)
    if (code.length === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/auth/profile', params: { phone } });
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      refs[0].current?.focus();
    }
    setVerifying(false);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(['', '', '', '']);
    setError('');
    refs[0].current?.focus();
  };

  const maskedPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';
  const filled = otp.filter((d) => d !== '').length;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.inner, { paddingTop: topPad + 24 }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Text style={styles.iconEmoji}>📱</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Verify your number</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          We sent a 4-digit OTP to{'\n'}
          <Text style={[styles.phoneHighlight, { color: colors.foreground }]}>{maskedPhone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={refs[idx]}
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: digit ? colors.secondary : colors.card,
                  color: colors.foreground,
                  borderWidth: digit ? 2 : 1,
                },
              ]}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.destructive} />
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: filled === 4 && !verifying ? colors.primary : colors.muted },
          ]}
          onPress={() => verifyOtp(otp.join(''))}
          disabled={filled < 4 || verifying}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: filled === 4 ? '#fff' : colors.mutedForeground }]}>
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0} style={styles.resendRow}>
          <Text style={[styles.resendText, { color: resendTimer > 0 ? colors.mutedForeground : colors.primary }]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.demoNote, { backgroundColor: colors.warningBg, borderColor: colors.accent + '50' }]}>
          <MaterialCommunityIcons name="information-outline" size={14} color={colors.accent} />
          <Text style={[styles.demoText, { color: colors.warningText }]}>
            Demo mode — enter any 4 digits to continue
          </Text>
        </View>
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
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  phoneHighlight: { fontFamily: 'Inter_600SemiBold' },
  otpRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 8 },
  otpBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  resendRow: { alignItems: 'center' },
  resendText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  demoText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
