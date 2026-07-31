import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ConsumerProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, logout, updateRole, getUserOrders } = useApp();
  const savedAddress = currentUser?.savedAddress;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const initials = (currentUser?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const allOrders = getUserOrders();
  const deliveredCount = allOrders.filter((o) => o.status === 'delivered').length;
  const totalSpent = allOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.totalPrice, 0);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/phone');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSwitchRole = () => {
    Alert.alert('Switch Role', 'Choose a different role to use FarmLink as:', [
      {
        text: '🌾 Farmer — Sell Produce',
        onPress: async () => {
          await updateRole('farmer');
          router.replace('/(farmer)' as any);
        },
      },
      {
        text: '🏍️ Rider — Deliver & Earn',
        onPress: async () => {
          await updateRole('rider');
          router.replace('/(rider)' as any);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* Avatar + Identity */}
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name ?? '—'}</Text>
        <Text style={[styles.phone, { color: colors.mutedForeground }]}>{currentUser?.phone ?? '—'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '12' }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>🛒 Consumer</Text>
        </View>
      </View>

      {/* Stats Row */}
      {deliveredCount > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{deliveredCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.freshGreen }]}>₹{Math.round(totalSpent * 0.35)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Saved vs retail</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.accent }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Eco returns</Text>
          </View>
        </View>
      )}

      {/* FarmPass */}
      {currentUser?.hasFarmPass ? (
        <View style={[styles.farmPassCard, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40' }]}>
          <MaterialCommunityIcons name="shield-check" size={24} color={colors.freshGreen} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.farmPassTitle, { color: colors.freshGreen }]}>FarmPass Active</Text>
            <Text style={[styles.farmPassSub, { color: colors.freshGreen + 'BB' }]}>
              Free delivery on eligible ₹199+ home orders
            </Text>
          </View>
          <View style={[styles.activePill, { backgroundColor: colors.freshGreen }]}>
            <Text style={styles.activePillText}>ACTIVE</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.farmPassCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/farmpass')}
          activeOpacity={0.85}
        >
          <Text style={styles.farmPassEmoji}>🌿</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.farmPassTitle, { color: colors.foreground }]}>Get FarmPass</Text>
              <Text style={[styles.farmPassSub, { color: colors.mutedForeground }]}>Free eligible delivery · ₹49/month</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DELIVERY ADDRESS</Text>
        <TouchableOpacity
          style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/checkout/address')}
          activeOpacity={0.85}
        >
          <View style={[styles.addressIcon, { backgroundColor: colors.primary + '12' }]}>
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            {savedAddress ? (
              <Text style={[styles.addressText, { color: colors.foreground }]} numberOfLines={2}>
                {savedAddress.fullAddress}
              </Text>
            ) : (
              <Text style={[styles.addressPlaceholder, { color: colors.mutedForeground }]}>
                No address saved — tap to add
              </Text>
            )}
          </View>
          <Text style={[styles.editLink, { color: colors.primary }]}>
            {savedAddress ? 'Edit' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.actionList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => router.push('/farmpass')}
          >
            <MaterialCommunityIcons name="leaf" size={20} color={colors.freshGreen} />
            <Text style={[styles.actionLabel, { color: colors.foreground, flex: 1 }]}>FarmPass</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => router.push('/checkout/address')}
          >
            <Feather name="map-pin" size={20} color={colors.foreground} />
            <Text style={[styles.actionLabel, { color: colors.foreground, flex: 1 }]}>Delivery Address</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={handleSwitchRole}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.foreground} />
            <Text style={[styles.actionLabel, { color: colors.foreground, flex: 1 }]}>Switch Role</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionRow, styles.actionRowLast, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.destructive} />
            <Text style={[styles.actionLabel, { color: colors.destructive, flex: 1 }]}>Log Out</Text>
          </Pressable>
        </View>
      </View>

      {/* Trust Signals */}
      <View style={styles.section}>
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Text style={styles.trustEmoji}>🌱</Text>
            <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>Zero{'\n'}middlemen</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustEmoji}>🚜</Text>
            <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>Direct from{'\n'}farm</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustEmoji}>🌿</Text>
            <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>Eco{'\n'}packaging</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustEmoji}>⚡</Text>
            <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>Fresh Station{'\n'}pickup</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          FarmLink · Farm-Fresh-Direct
        </Text>
        <Text style={[styles.footerRegion, { color: colors.border }]}>East Godavari, Andhra Pradesh</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  identity: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  phone: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  farmPassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  farmPassEmoji: { fontSize: 24 },
  farmPassTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  farmPassSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  activePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activePillText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 8 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  addressIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addressText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  addressPlaceholder: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  editLink: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  actionList: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  trustRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trustItem: { alignItems: 'center', gap: 6, flex: 1 },
  trustEmoji: { fontSize: 24 },
  trustLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textAlign: 'center', lineHeight: 14 },
  footer: { alignItems: 'center', paddingTop: 8, gap: 4 },
  footerText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  footerRegion: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
