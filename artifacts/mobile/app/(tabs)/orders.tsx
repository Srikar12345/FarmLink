import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useApp, type Order } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STEPS: { key: Order['status']; label: string }[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'delivered', label: 'Delivered' },
];

function StatusTimeline({ status }: { status: Order['status'] }) {
  const colors = useColors();
  if (status === 'cancelled') {
    return (
      <View style={[styles.cancelledBanner, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '30' }]}>
        <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.destructive} />
        <Text style={[styles.cancelledText, { color: colors.destructive }]}>Order Cancelled</Text>
      </View>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <View style={styles.timeline}>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        return (
          <React.Fragment key={step.key}>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineDot, { backgroundColor: done ? colors.freshGreen : colors.border }]}>
                {done && <MaterialCommunityIcons name="check" size={8} color="#fff" />}
              </View>
              <Text style={[styles.timelineLabel, { color: done ? colors.freshGreen : colors.mutedForeground }]}>
                {step.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: i < currentIdx ? colors.freshGreen : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
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

      <StatusTimeline status={order.status} />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="package-variant" size={14} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {order.quantity} {order.quantityUnit} · ₹{order.totalPrice}
            {order.deliveryFee > 0 ? ` + ₹${order.deliveryFee} delivery` : ' · Free delivery'}
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

      {order.status === 'pending' && (
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.destructive + '40', backgroundColor: colors.destructive + '08' }]}
          onPress={() => onCancel(order.id)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.destructive} />
          <Text style={[styles.cancelBtnText, { color: colors.destructive }]}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ConsumerOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getUserOrders, updateOrderStatus } = useApp();
  const orders = getUserOrders();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'picked_up').length;

  const handleCancel = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          updateOrderStatus(orderId, 'cancelled');
        },
      },
      { text: 'Keep Order', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.heading, { color: colors.foreground }]}>My Orders</Text>
          {pendingCount > 0 && (
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              {pendingCount} active
            </Text>
          )}
        </View>
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
              Browse fresh listings from local farmers and place your first order
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)' as any)}
              activeOpacity={0.85}
            >
              <Text style={[styles.emptyBtnText, { color: '#fff' }]}>Browse Listings</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} onCancel={handleCancel} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  subheading: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
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
    paddingBottom: 10,
  },
  produce: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  farmer: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  timelineStep: { alignItems: 'center', gap: 4 },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  timelineLine: { flex: 1, height: 2, marginBottom: 12, marginHorizontal: 4 },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelledText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, marginHorizontal: 14 },
  details: { padding: 14, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21 },
  emptyBtn: { marginTop: 8, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
