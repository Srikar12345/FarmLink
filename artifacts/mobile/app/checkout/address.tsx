import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

import { useApp, type SavedAddress } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const LABELS: { key: SavedAddress['label']; emoji: string }[] = [
  { key: 'Home', emoji: '🏠' },
  { key: 'Work', emoji: '💼' },
  { key: 'Other', emoji: '📍' },
];

export default function AddressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveAddress, currentUser } = useApp();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const existing = currentUser?.savedAddress;
  const [label, setLabel] = useState<SavedAddress['label']>(existing?.label ?? 'Home');
  const [doorNo, setDoorNo] = useState(existing?.doorNo ?? '');
  const [landmark, setLandmark] = useState(existing?.landmark ?? '');
  const [area, setArea] = useState(existing?.area ?? '');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    existing?.lat ? { lat: existing.lat, lng: existing.lng! } : null,
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const topPad = Platform.OS === 'web' ? 80 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const canSave = doorNo.trim().length > 0 && area.trim().length > 0;

  const handleLocateMe = async () => {
    setLocating(true);
    setLocError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission denied. Fill in address manually.');
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setLocError('Could not get location. Please fill in address manually.');
    }
    setLocating(false);
  };

  const handleSave = async () => {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const parts = [doorNo.trim(), landmark.trim() ? `Near ${landmark.trim()}` : '', area.trim()].filter(Boolean);
    const addr: SavedAddress = {
      label,
      doorNo: doorNo.trim(),
      landmark: landmark.trim(),
      area: area.trim(),
      fullAddress: parts.join(', '),
      lat: coords?.lat,
      lng: coords?.lng,
    };
    await saveAddress(addr);
    if (returnTo) {
      router.replace(returnTo as any);
    } else {
      router.back();
    }
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

        <Text style={[styles.title, { color: colors.foreground }]}>Where should we deliver? 📍</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Save once — we'll remember it for every order
        </Text>

        {/* Label chips */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Save as</Text>
        <View style={styles.labelRow}>
          {LABELS.map((l) => {
            const isSelected = label === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                style={[
                  styles.labelChip,
                  {
                    backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLabel(l.key);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.labelEmoji}>{l.emoji}</Text>
                <Text style={[styles.labelText, { color: isSelected ? colors.primary : colors.foreground }]}>
                  {l.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Locate Me */}
        <TouchableOpacity
          style={[
            styles.locateBtn,
            {
              backgroundColor: coords ? colors.freshGreenBg : colors.secondary,
              borderColor: coords ? colors.freshGreen + '50' : colors.border,
            },
          ]}
          onPress={handleLocateMe}
          disabled={locating}
          activeOpacity={0.8}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name={coords ? 'check-circle' : 'crosshairs-gps'}
              size={20}
              color={coords ? colors.freshGreen : colors.primary}
            />
          )}
          <Text
            style={[
              styles.locateBtnText,
              { color: coords ? colors.freshGreen : colors.primary },
            ]}
          >
            {locating ? 'Getting your location...' : coords ? '✅ GPS location saved' : 'Locate Me'}
          </Text>
          {!coords && !locating && (
            <Text style={[styles.locateBtnSub, { color: colors.mutedForeground }]}>
              Tap to use your phone's GPS
            </Text>
          )}
        </TouchableOpacity>

        {locError ? (
          <Text style={[styles.locError, { color: colors.destructive }]}>{locError}</Text>
        ) : null}

        {/* Address form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>🚪 Door / Flat / House No *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              placeholder="e.g. 4-3, Flat 2B, H.No 12"
              placeholderTextColor={colors.mutedForeground}
              value={doorNo}
              onChangeText={setDoorNo}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>🏛️ Landmark (near / opposite)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              placeholder="e.g. ZPP School, SRMT Mall, SBI Bank"
              placeholderTextColor={colors.mutedForeground}
              value={landmark}
              onChangeText={setLandmark}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>🗺️ Area / Colony / Mandal *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              placeholder="e.g. Kakinada, Rajamahendravaram, Amalapuram"
              placeholderTextColor={colors.mutedForeground}
              value={area}
              onChangeText={setArea}
            />
          </View>
        </View>

        {doorNo && area ? (
          <View style={[styles.preview, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="map-marker-check-outline" size={16} color={colors.primary} />
            <Text style={[styles.previewText, { color: colors.foreground }]}>
              {[doorNo.trim(), landmark.trim() ? `Near ${landmark.trim()}` : '', area.trim()].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.muted }]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="check" size={18} color={canSave ? '#fff' : colors.mutedForeground} />
          <Text style={[styles.saveBtnText, { color: canSave ? '#fff' : colors.mutedForeground }]}>
            Save Address & Continue
          </Text>
        </TouchableOpacity>

        <Text style={[styles.privacy, { color: colors.mutedForeground }]}>
          🔐 Your address is stored securely and only shared with your rider at delivery time.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 0 },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 10 },
  labelRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  labelChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
  },
  labelEmoji: { fontSize: 22 },
  labelText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  locateBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1 },
  locateBtnSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  locError: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  form: { gap: 14, marginTop: 10, marginBottom: 16 },
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
  preview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  previewText: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 19 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  privacy: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
});
