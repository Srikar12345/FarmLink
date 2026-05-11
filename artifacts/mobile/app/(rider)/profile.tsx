import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp, type VehicleType } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const VEHICLES: { type: VehicleType; label: string; emoji: string }[] = [
  { type: 'bike', label: 'Bike / Scooty', emoji: '🏍️' },
  { type: 'auto', label: 'Auto Rickshaw', emoji: '🛺' },
  { type: 'cab', label: 'Car / Cab', emoji: '🚗' },
];

export default function RiderProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, updateRiderProfile, switchRole, logout, orders } = useApp();
  const [uploading, setUploading] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const myDeliveries = orders.filter((o) => o.riderId === currentUser?.id);
  const completed = myDeliveries.filter((o) => o.status === 'delivered').length;
  const totalEarnings = myDeliveries
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Math.max(40, Math.round(o.totalPrice * 0.12)), 0);

  const handleUploadID = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to upload your ID.');
      return;
    }
    setUploading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      await updateRiderProfile({ idProofUri: result.assets[0].uri, idVerified: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setUploading(false);
  };

  // Direct logout — no Alert dialog (works reliably on web and native)
  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/auth/phone');
  };

  const handleSwitchRole = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await switchRole();
    router.replace('/auth/phone');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.riderColor + '18' }]}>
            <Text style={styles.avatarEmoji}>🏍️</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name}</Text>
          <Text style={[styles.phone, { color: colors.mutedForeground }]}>{currentUser?.phone}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.riderColor + '12' }]}>
            <MaterialCommunityIcons name="motorbike" size={13} color={colors.riderColor} />
            <Text style={[styles.roleText, { color: colors.riderColor }]}>Delivery Rider</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Deliveries', value: `${completed}`, color: colors.riderColor },
            { label: 'Earned', value: `₹${totalEarnings}`, color: colors.freshGreen },
            { label: currentUser?.idVerified ? 'Verified' : 'Pending', value: currentUser?.idVerified ? '✓' : '⏳', color: currentUser?.idVerified ? colors.freshGreen : colors.accent },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Vehicle */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vehicle</Text>
          <View style={styles.vehicleRow}>
            {VEHICLES.map((v) => {
              const isSelected = currentUser?.vehicleType === v.type;
              return (
                <TouchableOpacity
                  key={v.type}
                  style={[
                    styles.vehicleChip,
                    {
                      backgroundColor: isSelected ? colors.riderColor + '12' : colors.background,
                      borderColor: isSelected ? colors.riderColor : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateRiderProfile({ vehicleType: v.type });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vehicleLabel, { color: isSelected ? colors.riderColor : colors.mutedForeground }]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ID Verification */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>ID Verification</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Aadhaar · PAN · Driving Licence
              </Text>
            </View>
            {currentUser?.idVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.freshGreenBg }]}>
                <MaterialCommunityIcons name="shield-check" size={14} color={colors.freshGreen} />
                <Text style={[styles.verifiedText, { color: colors.freshGreen }]}>Verified</Text>
              </View>
            )}
          </View>

          {currentUser?.idProofUri ? (
            <View style={styles.idPreview}>
              <Image source={{ uri: currentUser.idProofUri }} style={styles.idImage} resizeMode="cover" />
              <TouchableOpacity
                style={[styles.reuploadBtn, { borderColor: colors.border }]}
                onPress={handleUploadID}
              >
                <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
                <Text style={[styles.reuploadText, { color: colors.mutedForeground }]}>Re-upload</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={handleUploadID}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="card-account-details-outline" size={28} color={colors.mutedForeground} />
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>
                {uploading ? 'Uploading…' : 'Upload ID Proof'}
              </Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
                Tap to choose from gallery
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Earnings info */}
        <View style={[styles.section, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '30' }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.freshGreen} />
          <Text style={[styles.earningsNote, { color: colors.freshGreen }]}>
            After each delivery you choose: receive cash/UPI instantly, or apply earnings as FarmLink grocery credits (with a 15% bonus — credits work like money inside the app)
          </Text>
        </View>

        {/* Switch role */}
        <Pressable
          style={({ pressed }) => [
            styles.switchBtn,
            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={handleSwitchRole}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.mutedForeground} />
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Switch Role</Text>
        </Pressable>

        {/* Log out */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              borderColor: colors.destructive + '50',
              backgroundColor: colors.destructive + '08',
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 14 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarEmoji: { fontSize: 36 },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  phone: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  roleText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  vehicleRow: { gap: 8 },
  vehicleChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  vehicleEmoji: { fontSize: 20 },
  vehicleLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  uploadBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14, padding: 24, alignItems: 'center', gap: 6 },
  uploadTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  uploadSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  idPreview: { gap: 10 },
  idImage: { width: '100%', height: 160, borderRadius: 12 },
  reuploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1 },
  reuploadText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  earningsNote: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  switchText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
