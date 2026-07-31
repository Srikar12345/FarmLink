import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaymentChoiceModal } from '@/components/PaymentChoiceModal';
import { RiderVerifyModal } from '@/components/RiderVerifyModal';
import { useApp, type Order } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { openMaps } from '@/utils/openMaps';

function NavButton({ order, address, label }: { order: Order; address: string; label: string }) {
  const colors = useColors();
  const handleNavigate = () => {
    openMaps(address);
    import('../../utils/events').then(({ AppEvents }) => {
      AppEvents.emit('order:status', {
        orderId: order.id,
        status: 'rider_navigating',
        produceName: order.produceName,
        riderName: order.riderName || 'Rider',
      });
    });
  };

  return (
    <TouchableOpacity
      style={[styles.navBtn, { backgroundColor: colors.consumerColor + '12', borderColor: colors.consumerColor + '30' }]}
      onPress={handleNavigate}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="navigation-variant-outline" size={13} color={colors.consumerColor} />
      <Text style={[styles.navBtnText, { color: colors.consumerColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DeliveryCard({
  order,
  onAccept,
  onComplete,
}: {
  order: Order;
  onAccept: (o: Order) => void;
  onComplete: (o: Order) => void;
}) {
  const colors = useColors();
  const { currentUser } = useApp();
  const isMyOrder = order.riderId === currentUser?.id;
  const cashEarnings = Math.max(40, Math.round(order.totalPrice * 0.12));
  const creditEarnings = Math.round(cashEarnings * 1.15);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.produce, { color: colors.foreground }]}>{order.produceName}</Text>
          <Text style={[styles.qty, { color: colors.mutedForeground }]}>
            {order.quantity} {order.quantityUnit}
          </Text>
        </View>
        <View style={styles.earningsBlock}>
          <Text style={[styles.earningsAmount, { color: colors.riderColor }]}>₹{cashEarnings}</Text>
          <Text style={[styles.earningsSub, { color: colors.mutedForeground }]}>cash</Text>
        </View>
      </View>

      {/* Credits option strip */}
      <View style={[styles.creditStrip, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '30' }]}>
        <MaterialCommunityIcons name="ticket-percent-outline" size={13} color={colors.freshGreen} />
        <Text style={[styles.creditStripText, { color: colors.freshGreen }]}>
          Or take ₹{creditEarnings} as FarmLink grocery credits (+15%)
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Route */}
      <View style={styles.route}>
        {/* Pickup */}
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeTag, { color: colors.mutedForeground }]}>PICKUP</Text>
            <Text style={[styles.routeName, { color: colors.foreground }]}>{order.farmerName}</Text>
            <Text style={[styles.routeAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
              {order.farmerLocation}
            </Text>
          </View>
          <NavButton order={order} address={order.farmerLocation} label="Navigate" />
        </View>

        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />

        {/* Dropoff */}
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.riderColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeTag, { color: colors.mutedForeground }]}>DELIVER TO</Text>
            <Text style={[styles.routeName, { color: colors.foreground }]}>{order.consumerName}</Text>
            <Text style={[styles.routeAddr, { color: colors.mutedForeground }]} numberOfLines={2}>
              {order.consumerAddress}
            </Text>
            <Text style={[styles.consumerPhone, { color: colors.mutedForeground }]}>
              {order.consumerPhone}
            </Text>
          </View>
          <NavButton order={order} address={order.consumerAddress} label="Navigate" />
        </View>

        {order.packagingReturnRequested && (
          <>
            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.freshGreen }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeTag, { color: colors.mutedForeground }]}>COLLECT PACKAGING</Text>
                <Text style={[styles.routeAddr, { color: colors.freshGreen }]}>
                  Return empty {order.packagingType?.replace('_', ' ')} to farmer
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      {order.status === 'pending' && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.riderColor }]}
          onPress={() => onAccept(order)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="motorbike" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Accept · Earn ₹{cashEarnings}</Text>
        </TouchableOpacity>
      )}

      {isMyOrder && order.status === 'picked_up' && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.freshGreen }]}
          onPress={() => onComplete(order)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Mark as Delivered</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RiderDeliveries() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getAvailableOrders, getActiveRiderOrder, acceptOrder, updateOrderStatus, currentUser, orders, setDailyEarningGoal } =
    useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);

  const available = getAvailableOrders();
  const active = getActiveRiderOrder();
  const allOrders = active ? [active, ...available] : available;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // Random verification check on tab open (25%)
  useEffect(() => {
    if (currentUser?.role !== 'rider' || !currentUser?.idVerified) return;
    if (Math.random() < 0.25) {
      const t = setTimeout(() => setShowVerify(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    acceptOrder(order.id);
  };

  const handleComplete = (order: Order) => {
    // 30% chance of identity verification on delivery complete
    if (Math.random() < 0.3) {
      setCompletingOrder(order);
      setShowVerify(true);
      return;
    }
    setCompletingOrder(order);
    setShowPayment(true);
  };

  const finishDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'delivered');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  // Earnings and daily-goal optimisation
  const now = new Date();
  const myDeliveries = orders.filter(
    (o) =>
      o.riderId === currentUser?.id &&
      o.status === 'delivered' &&
      new Date(o.updatedAt).getMonth() === now.getMonth(),
  );
  const totalEarned = myDeliveries.reduce(
    (s, o) => s + Math.max(40, Math.round(o.totalPrice * 0.12)),
    0,
  );
  const todayKey = new Date().toDateString();
  const todayEarned = orders
    .filter((o) => o.riderId === currentUser?.id && o.status === 'delivered' && new Date(o.updatedAt).toDateString() === todayKey)
    .reduce((sum, order) => sum + Math.max(40, Math.round(order.totalPrice * 0.12)), 0);
  const goal = currentUser?.dailyEarningGoal ?? 500;
  const remaining = Math.max(0, goal - todayEarned);
  const bestNext = [...available].sort((a, b) => b.totalPrice - a.totalPrice)[0];
  const bestEarning = bestNext ? Math.max(40, Math.round(bestNext.totalPrice * 0.12)) : 0;
  const tripsLeft = remaining === 0 ? 0 : Math.ceil(remaining / Math.max(bestEarning, 40));

  const chooseGoal = () => {
    Alert.alert('Set daily earning goal', 'FarmLink uses this to recommend efficient next deliveries.', [
      { text: '₹500', onPress: () => setDailyEarningGoal(500) },
      { text: '₹750', onPress: () => setDailyEarningGoal(750) },
      { text: '₹1,000', onPress: () => setDailyEarningGoal(1000) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pendingCash = Math.max(40, Math.round((completingOrder?.totalPrice ?? 0) * 0.12));
  const pendingCredit = Math.round(pendingCash * 1.15);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={allOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.riderColor} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.pageTitle, { color: colors.foreground }]}>Deliveries</Text>
                <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
                  {currentUser?.name}
                  {currentUser?.idVerified ? ' · ✓ Verified' : ''}
                </Text>
              </View>
              {currentUser?.idVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.freshGreenBg }]}>
                  <MaterialCommunityIcons name="shield-check" size={14} color={colors.freshGreen} />
                  <Text style={[styles.verifiedText, { color: colors.freshGreen }]}>ID Verified</Text>
                </View>
              )}
            </View>

            {totalEarned > 0 && (
              <View style={[styles.earningsCard, { backgroundColor: colors.riderColor + '0D', borderColor: colors.riderColor + '25' }]}>
                <View>
                  <Text style={[styles.earningsCardLabel, { color: colors.mutedForeground }]}>This month</Text>
                  <Text style={[styles.earningsCardValue, { color: colors.riderColor }]}>₹{totalEarned}</Text>
                  <Text style={[styles.earningsCardSub, { color: colors.mutedForeground }]}>
                    {myDeliveries.length} {myDeliveries.length === 1 ? 'delivery' : 'deliveries'}
                  </Text>
                </View>
                <View style={[styles.creditHint, { backgroundColor: colors.riderColor + '15' }]}>
                  <MaterialCommunityIcons name="ticket-percent" size={18} color={colors.riderColor} />
                  <Text style={[styles.creditHintText, { color: colors.riderColor }]}>
                    Apply as{'\n'}grocery credits
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.goalCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}
              onPress={chooseGoal}
              activeOpacity={0.85}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <MaterialCommunityIcons name="target" size={19} color="#7C3AED" />
                  <Text style={styles.goalTitle}>Today’s earning goal</Text>
                </View>
                <Text style={styles.editGoal}>Edit</Text>
              </View>
              <View style={styles.goalNumbers}>
                <Text style={styles.goalValue}>₹{todayEarned}</Text>
                <Text style={styles.goalOf}>of ₹{goal}</Text>
                <Text style={styles.goalStatus}>{remaining === 0 ? 'Goal reached!' : `₹${remaining} to go`}</Text>
              </View>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${Math.min(100, Math.round((todayEarned / goal) * 100))}%` }]} />
              </View>
              {remaining > 0 && (
                <Text style={styles.goalHint}>
                  {bestNext ? `Best next: ${bestNext.produceName} · earn ₹${bestEarning} · about ${tripsLeft} efficient trip${tripsLeft === 1 ? '' : 's'} left` : 'We’ll recommend the next efficient order as soon as it arrives.'}
                </Text>
              )}
            </TouchableOpacity>

            {active && (
              <View style={[styles.activeBanner, { backgroundColor: colors.riderColor + '12', borderColor: colors.riderColor + '40' }]}>
                <MaterialCommunityIcons name="motorbike" size={15} color={colors.riderColor} />
                <Text style={[styles.activeBannerText, { color: colors.riderColor }]}>
                  Active delivery in progress
                </Text>
              </View>
            )}

            {allOrders.length > 0 && (
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
                {available.length} available{active ? ' · 1 in progress' : ''}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="inbox-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No deliveries available</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              New pickup requests appear here when consumers order. Pull down to refresh.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DeliveryCard order={item} onAccept={handleAccept} onComplete={handleComplete} />
        )}
      />

      <RiderVerifyModal
        visible={showVerify}
        onVerified={() => {
          setShowVerify(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (completingOrder) setShowPayment(true);
        }}
        onDismiss={() => {
          setShowVerify(false);
          setCompletingOrder(null);
        }}
      />

      <PaymentChoiceModal
        visible={showPayment}
        cashAmount={pendingCash}
        creditAmount={pendingCredit}
        onCash={() => {
          setShowPayment(false);
          if (completingOrder) finishDelivery(completingOrder);
          setCompletingOrder(null);
        }}
        onCredit={() => {
          setShowPayment(false);
          if (completingOrder) finishDelivery(completingOrder);
          setCompletingOrder(null);
        }}
        onDismiss={() => {
          setShowPayment(false);
          setCompletingOrder(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20 },
  listHeader: { marginBottom: 16, gap: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  pageSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  earningsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsCardLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  earningsCardValue: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  earningsCardSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  goalCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  goalTitle: { color: '#5B21B6', fontSize: 13, fontFamily: 'Inter_700Bold' },
  editGoal: { color: '#7C3AED', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  goalNumbers: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  goalValue: { color: '#4C1D95', fontSize: 27, fontFamily: 'Inter_700Bold' },
  goalOf: { color: '#7C3AED', fontSize: 13, fontFamily: 'Inter_400Regular' },
  goalStatus: { color: '#16A34A', fontSize: 11, fontFamily: 'Inter_700Bold', marginLeft: 'auto' },
  goalTrack: { height: 7, backgroundColor: '#DDD6FE', borderRadius: 9, overflow: 'hidden' },
  goalFill: { height: 7, backgroundColor: '#7C3AED', borderRadius: 9 },
  goalHint: { color: '#6B21A8', fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular' },
  creditHint: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  creditHintText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'center', lineHeight: 15 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeBannerText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  sectionCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
  },
  produce: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  qty: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  earningsBlock: { alignItems: 'flex-end' },
  earningsAmount: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  earningsSub: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  creditStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  creditStripText: { fontSize: 11, fontFamily: 'Inter_500Medium', flex: 1 },
  divider: { height: 1 },
  route: { padding: 14, gap: 4 },
  routePoint: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  routeLine: { width: 2, height: 12, marginLeft: 4, marginVertical: 3 },
  routeTag: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5, marginBottom: 1 },
  routeName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  routeAddr: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, marginTop: 1 },
  consumerPhone: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  navBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
  },
  actionBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 20, lineHeight: 21 },
});
