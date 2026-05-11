import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useApp, type Order } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function FarmerOrderCard({ order }: { order: Order }) {
  const colors = useColors();
  const { updateOrderStatus } = useApp();

  const handleCancel = () => {
    Alert.alert('Cancel Order?', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          updateOrderStatus(order.id, 'cancelled');
        },
      },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.produce, { color: colors.foreground }]}>{order.produceName}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {order.consumerName} · {order.consumerPhone}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {order.consumerAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="package-variant" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {order.quantity} {order.quantityUnit} · ₹{order.totalPrice}
          </Text>
        </View>
        {order.riderName && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="motorbike" size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Rider: {order.riderName}
            </Text>
          </View>
        )}
      </View>

      {order.status === 'pending' && (
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.destructive }]}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={[styles.cancelText, { color: colors.destructive }]}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function FarmerOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getFarmerOrders } = useApp();
  const orders = getFarmerOrders();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!orders.length}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Incoming Orders</Text>
            {orders.length > 0 && (
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                {orders.filter((o) => o.status === 'pending').length} pending · {orders.length} total
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="inbox-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Orders from consumers will appear here
            </Text>
          </View>
        }
        renderItem={({ item }) => <FarmerOrderCard order={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 12,
  },
  produce: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { height: 1, marginHorizontal: 14 },
  cardBody: { padding: 14, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  cancelBtn: {
    borderTopWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  cancelText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 20 },
});
