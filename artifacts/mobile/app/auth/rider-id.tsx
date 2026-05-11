import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

const ID_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card', emoji: '🪪' },
  { key: 'pan', label: 'PAN Card', emoji: '💳' },
  { key: 'dl', label: "Driver's Licence", emoji: '🚗' },
  { key: 'passport', label: 'Passport', emoji: '📕' },
];

export default function RiderIdScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone, role, name, location, vehicleType } = useLocalSearchParams<{
    phone: string;
    role: string;
    name: string;
    location: string;
    vehicleType: string;
  }>();
  const { setupUser } = useApp();

  const [idType, setIdType] = useState('aadhaar');
  const [idUri, setIdUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const pickId = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload your ID.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled) setIdUri(result.assets[0].uri);
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera needed', 'Please allow camera access to take your selfie.');
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

  const handleSubmit = async () => {
    if (!idUri || !selfieUri) {
      Alert.alert('Required', 'Please upload your ID and take a selfie to continue.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVerifying(true);
    // Simulate background verification
    await new Promise((r) => setTimeout(r, 1500));
    await setupUser({
      name: name as string,
      phone: `+91 ${(phone as string)?.slice(0, 5)} ${(phone as string)?.slice(5)}`,
      role: role as UserRole,
      location: (location as string) || 'East Godavari, AP',
      vehicleType: vehicleType as VehicleType,
      idVerified: true,
      idProofUri: idUri,
    });
    setVerifying(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '✅ Identity Verified',
      'Welcome to FarmLink! Your ID has been verified. You can now accept delivery orders.\n\nNote: Random identity checks will happen during deliveries for community safety.',
      [{ text: "Let's Go!", onPress: () => router.replace('/(rider)' as any) }],
    );
  };

  const canSubmit = idUri && selfieUri;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={[styles.safeBadge, { backgroundColor: colors.riderColor + '12' }]}>
        <Text style={{ fontSize: 15 }}>🏍️</Text>
        <Text style={[styles.safeBadgeText, { color: colors.riderColor }]}>Almost ready to ride!</Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>One quick safety check 🛡️</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        We verify every delivery partner before their first trip — not to be difficult, but to keep the whole
        community safe. Farmers trust us with their produce, and families trust us at their doors. 🤝{'\n\n'}
        Your documents are encrypted and never shared with anyone.
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>1. Choose ID type</Text>
        <View style={styles.idGrid}>
          {ID_TYPES.map((t) => {
            const isSelected = idType === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.idChip,
                  {
                    backgroundColor: isSelected ? colors.riderColor + '12' : colors.card,
                    borderColor: isSelected ? colors.riderColor : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setIdType(t.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.idEmoji}>{t.emoji}</Text>
                <Text style={[styles.idLabel, { color: isSelected ? colors.riderColor : colors.foreground }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>2. Upload your {ID_TYPES.find((t) => t.key === idType)?.label}</Text>
        <TouchableOpacity
          style={[styles.uploadBox, { borderColor: idUri ? colors.primary : colors.border, backgroundColor: colors.card }]}
          onPress={pickId}
          activeOpacity={0.8}
        >
          {idUri ? (
            <>
              <Image source={{ uri: idUri }} style={styles.uploadPreview} resizeMode="cover" />
              <View style={[styles.uploadOverlay, { backgroundColor: colors.primary + 'CC' }]}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#fff" />
                <Text style={styles.uploadOverlayText}>ID Uploaded</Text>
                <Text style={styles.uploadOverlaySub}>Tap to change</Text>
              </View>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="card-account-details-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload ID Photo</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
                Clear photo of front side · JPG or PNG
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>3. Take a selfie</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Used for random identity checks during deliveries
        </Text>
        <TouchableOpacity
          style={[styles.selfieBox, { borderColor: selfieUri ? colors.riderColor : colors.border, backgroundColor: colors.card }]}
          onPress={takeSelfie}
          activeOpacity={0.8}
        >
          {selfieUri ? (
            <>
              <Image source={{ uri: selfieUri }} style={styles.selfiePreview} resizeMode="cover" />
              <View style={[styles.selfieCheck, { backgroundColor: colors.riderColor }]}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="camera-account" size={44} color={colors.mutedForeground} />
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Take Selfie</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
                Front camera · Clear face visible
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: canSubmit ? colors.riderColor : colors.muted }]}
        onPress={handleSubmit}
        disabled={!canSubmit || verifying}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name={verifying ? 'loading' : 'shield-check'}
          size={18}
          color={canSubmit ? '#fff' : colors.mutedForeground}
        />
        <Text style={[styles.btnText, { color: canSubmit ? '#fff' : colors.mutedForeground }]}>
          {verifying ? 'Verifying Identity...' : 'Submit & Get Verified'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.privacy, { color: colors.mutedForeground }]}>
        🔒 Your ID is encrypted and stored securely. Never shared with farmers or consumers.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  safeBadgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  whyCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 8 },
  whyTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  whyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  whyText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -6 },
  idGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '46%',
  },
  idEmoji: { fontSize: 18 },
  idLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  uploadPreview: { position: 'absolute', width: '100%', height: '100%' },
  uploadOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadOverlayText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 },
  uploadOverlaySub: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', fontSize: 12 },
  uploadTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  uploadSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  selfieBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 80,
    width: 160,
    height: 160,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  selfiePreview: { position: 'absolute', width: '100%', height: '100%' },
  selfieCheck: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  privacy: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
});
