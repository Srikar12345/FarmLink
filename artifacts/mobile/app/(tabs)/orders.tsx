import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useApp, type Order } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderCard({ order }: { order: Order }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.produce, { color: colors.foreground }]}>{order.produceName}</Text>
          <Text style={[styles.farmer, { color: colors.mutedForeground }]}>from {order.farmerName}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="package-variant" size={14} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {order.quantity} {order.quantityUnit} · ₹{order.totalPrice} + ₹{order.deliveryFee} delivery
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {order.consumerAddress}
          </Text>
        </View>
        {order.riderName && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="motorbike" size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.primary }]}>
              {order.riderName} · {order.riderPhone}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ConsumerOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getUserOrders, logout, updateRole } = useApp();
  const orders = getUserOrders();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/phone');
  };

  const handleSwitchRole = () => {
    Alert.alert(
      'Switch Role',
      'Choose a different role to use FarmLink as:',
      [
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
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Fixed header — outside FlatList so Pressable always works */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>My Orders</Text>
        <Pressable
          style={({ pressed }) => [
            styles.switchRoleBtn,
            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={handleSwitchRole}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={15} color={colors.mutedForeground} />
          <Text style={[styles.switchRoleText, { color: colors.mutedForeground }]}>Switch Role</Text>
        </Pressable>
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
          <MaterialCommunityIcons name="logout" size={15} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bag-checked" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Browse fresh listings and place your first order
            </Text>
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  heading: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchRoleText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 12,
  },
  produce: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  farmer: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { height: 1, marginHorizontal: 14 },
  details: { padding: 14, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
