import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  onVerified: () => void;
  onDismiss: () => void;
}

export function RiderVerifyModal({ visible, onVerified, onDismiss }: Props) {
  const colors = useColors();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // On web/simulator, simulate a selfie
      setSelfieUri('simulated');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setSelfieUri(result.assets[0].uri);
  };

  const handleVerify = async () => {
    if (!selfieUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setSelfieUri(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onVerified();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.riderColor + '15' }]}>
            <MaterialCommunityIcons name="shield-account" size={36} color={colors.riderColor} />
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>Quick Identity Check</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            FarmLink randomly verifies that deliveries are being made by registered riders. Take a quick selfie to continue.
          </Text>

          <View style={[styles.reasonCard, { backgroundColor: colors.muted }]}>
            <MaterialCommunityIcons name="information-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>
              This protects consumers and maintains the trust that makes FarmLink work for everyone in the community.
            </Text>
          </View>

          {selfieUri && selfieUri !== 'simulated' ? (
            <View style={styles.selfieContainer}>
              <Image source={{ uri: selfieUri }} style={styles.selfieImage} resizeMode="cover" />
              <View style={[styles.selfieCheck, { backgroundColor: colors.riderColor }]}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            </View>
          ) : selfieUri === 'simulated' ? (
            <View style={[styles.selfieSimulated, { backgroundColor: colors.riderColor + '20' }]}>
              <MaterialCommunityIcons name="account-circle" size={60} color={colors.riderColor} />
              <Text style={[styles.simulatedText, { color: colors.riderColor }]}>Selfie captured ✓</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.selfieBtn, { backgroundColor: colors.riderColor + '12', borderColor: colors.riderColor + '40' }]}
              onPress={takeSelfie}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera-account" size={32} color={colors.riderColor} />
              <Text style={[styles.selfieBtnText, { color: colors.riderColor }]}>Take Selfie</Text>
              <Text style={[styles.selfieBtnSub, { color: colors.mutedForeground }]}>Front camera</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: selfieUri ? colors.riderColor : colors.muted }]}
              onPress={handleVerify}
              disabled={!selfieUri || verifying}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={18}
                color={selfieUri ? '#fff' : colors.mutedForeground}
              />
              <Text style={[styles.verifyBtnText, { color: selfieUri ? '#fff' : colors.mutedForeground }]}>
                {verifying ? 'Verifying...' : 'Confirm Identity'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDismiss} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                Skip for now (limited to 3 skips)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  iconBox: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21 },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  reasonText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 17 },
  selfieContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  selfieImage: { width: '100%', height: '100%' },
  selfieCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieSimulated: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  simulatedText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  selfieBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  selfieBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  selfieBtnSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  actions: { width: '100%', gap: 10 },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  verifyBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
