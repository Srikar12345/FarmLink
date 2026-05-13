import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EcoPackagingInfo } from '@/components/EcoPackagingInfo';
import { FreshnessTag } from '@/components/FreshnessTag';
import { PriceComparison } from '@/components/PriceComparison';
import { UPICheckout } from '@/components/UPICheckout';
import { useApp, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { openMaps } from '@/utils/openMaps';

const CATEGORY_ICONS: Record<ProduceCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  vegetables: 'carrot',
  fruits: 'fruit-grapes',
  grains: 'grain',
  dairy: 'cow',
  herbs: 'leaf',
  seafood: 'fish',
  meat: 'food-drumstick-outline',
  other: 'basket',
};

const CATEGORY_COLORS: Record<ProduceCategory, string> = {
  vegetables: '#16A34A',
  fruits: '#EA580C',
  grains: '#B45309',
  dairy: '#2563EB',
  herbs: '#7C3AED',
  seafood: '#0891B2',
  meat: '#DC2626',
  other: '#6B7280',
};

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { listings, currentUser, createOrder, requestPackagingReturn, getUserOrders } = useApp();
  const listing = listings.find((l) => l.id === id);

  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!listing) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 80 }}>
          Listing not found
        </Text>
      </View>
    );
  }

  const iconColor = CATEGORY_COLORS[listing.category];
  const packagingDeposit = listing.packagingDeposit ?? 0;
  const total = listing.price * quantity;
  const hasFarmPass = currentUser?.hasFarmPass ?? false;
  const deliveryFee = hasFarmPass ? 0 : Math.max(20, Math.round(total * 0.1));
  const grandTotal = total + deliveryFee + packagingDeposit;
  const netCost = total + deliveryFee; // cost without refundable deposit
  const isConsumer = currentUser?.role === 'consumer';

  const savedAddress = currentUser?.savedAddress;

  // Find delivered order for this listing (for return packaging button)
  const myDeliveredOrders = getUserOrders().filter(
    (o) => o.listingId === listing.id && o.status === 'delivered',
  );
  const latestDeliveredOrder = myDeliveredOrders[0];

  const handleOrder = () => {
    if (!savedAddress) {
      Alert.alert(
        'Delivery Address Required',
        'Please add your delivery address before placing an order.',
        [
          { text: 'Add Address', onPress: () => router.push({ pathname: '/checkout/address' }) },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (_paymentId: string) => {
    setShowPayment(false);
    if (!savedAddress) return;
    const order = createOrder({
      listingId: listing.id,
      consumerAddress: savedAddress.fullAddress,
      quantity,
    });
    if (order) {
      const depositMsg = packagingDeposit > 0
        ? `\n\n🌿 Eco-deposit ₹${packagingDeposit} will be refunded when you return the ${listing.packagingType?.replace('_', ' ')}.`
        : '';
      Alert.alert(
        '🎉 Order Placed!',
        `Your order for ${listing.produceName} is confirmed. A rider will pick it up soon.${depositMsg}`,
        [
          { text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') },
          { text: 'OK', onPress: () => router.back() },
        ],
      );
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 120 }}
      >
        <View style={[styles.hero, { backgroundColor: iconColor + '15', paddingTop: topPad + 16 }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={[styles.heroIcon, { backgroundColor: iconColor + '25' }]}>
            <MaterialCommunityIcons name={CATEGORY_ICONS[listing.category]} size={72} color={iconColor} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>{listing.produceName}</Text>
              <Text style={[styles.category, { color: iconColor }]}>
                {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
              </Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={[styles.price, { color: colors.primary }]}>₹{listing.price}</Text>
              <Text style={[styles.perUnit, { color: colors.mutedForeground }]}>per {listing.priceUnit}</Text>
            </View>
          </View>

          <FreshnessTag harvestTime={listing.harvestTime} />

          <View style={[styles.farmerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.farmerAvatar, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.farmerName, { color: colors.foreground }]}>{listing.farmerName}</Text>
              <Text style={[styles.farmerLoc, { color: colors.mutedForeground }]}>
                {listing.farmerLocation}
              </Text>
            </View>
            <View style={styles.farmerRight}>
              {listing.totalReviews > 0 && (
                <View style={styles.ratingBlock}>
                  <MaterialCommunityIcons name="star" size={14} color={colors.starColor} />
                  <Text style={[styles.ratingText, { color: colors.foreground }]}>
                    {listing.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.mapBtn, { backgroundColor: colors.consumerColor + '12', borderColor: colors.consumerColor + '30' }]}
                onPress={() => openMaps(listing.farmerLocation)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="navigation-variant-outline" size={13} color={colors.consumerColor} />
                <Text style={[styles.mapBtnText, { color: colors.consumerColor }]}>Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {listing.description}
            </Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="package-variant" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Available</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {listing.quantity} {listing.quantityUnit}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="truck-delivery" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Delivery</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>Same Day</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="leaf" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Chemical</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>Free</Text>
            </View>
          </View>

          {/* Eco Packaging & Processing Info */}
          <EcoPackagingInfo
            packagingType={listing.packagingType}
            packagingDeposit={listing.packagingDeposit}
            processingStatus={listing.processingStatus}
            processingNote={listing.processingNote}
            orderId={latestDeliveredOrder?.id}
            orderStatus={latestDeliveredOrder?.status}
            packagingReturnRequested={latestDeliveredOrder?.packagingReturnRequested}
            onRequestReturn={requestPackagingReturn}
          />

          {/* Price Comparison */}
          <PriceComparison
            produceName={listing.produceName}
            farmLinkPrice={listing.price}
            priceUnit={listing.priceUnit}
            category={listing.category}
          />

          {isConsumer && (
            <View style={styles.orderSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Place Order</Text>

              {/* Quantity */}
              <View style={styles.qtyRow}>
                <Text style={[styles.qtyLabel, { color: colors.mutedForeground }]}>
                  Quantity ({listing.priceUnit})
                </Text>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Feather name="minus" size={16} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyNum, { color: colors.foreground }]}>{quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => setQuantity((q) => Math.min(listing.quantity, q + 1))}
                  >
                    <Feather name="plus" size={16} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delivery Address */}
              {savedAddress ? (
                <View style={[styles.addressBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.addressLeft}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.addressLabel, { color: colors.mutedForeground }]}>
                        Delivering to · {savedAddress.label}
                      </Text>
                      <Text style={[styles.addressText, { color: colors.foreground }]} numberOfLines={2}>
                        {savedAddress.fullAddress}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/checkout/address' })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.changeBtn, { color: colors.primary }]}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addAddressBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '08' }]}
                  onPress={() => router.push({ pathname: '/checkout/address' })}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="map-marker-plus-outline" size={20} color={colors.primary} />
                  <Text style={[styles.addAddressText, { color: colors.primary }]}>Add Delivery Address</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}

              {/* Price Summary */}
              <View style={[styles.summary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                    {quantity} {listing.priceUnit} × ₹{listing.price}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.foreground }]}>₹{total}</Text>
                </View>

                {/* Delivery fee row with FarmPass */}
                <View style={styles.summaryRow}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Delivery fee</Text>
                    {!hasFarmPass && (
                      <TouchableOpacity onPress={() => router.push('/farmpass')} activeOpacity={0.7}>
                        <Text style={[styles.farmPassNudge, { color: colors.freshGreen }]}>
                          🌿 ₹0 with FarmPass — Save ₹{deliveryFee}/order →
                        </Text>
                      </TouchableOpacity>
                    )}
                    {hasFarmPass && (
                      <Text style={[styles.farmPassActive, { color: colors.freshGreen }]}>
                        🌿 FarmPass active — free delivery!
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.summaryValue, {
                    color: hasFarmPass ? colors.freshGreen : colors.foreground,
                    textDecorationLine: hasFarmPass ? 'line-through' : 'none',
                  }]}>
                    {hasFarmPass ? `₹${Math.max(20, Math.round(total * 0.1))}` : `₹${deliveryFee}`}
                  </Text>
                </View>
                {hasFarmPass && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.freshGreen }]}>Delivery (FarmPass)</Text>
                    <Text style={[styles.summaryValue, { color: colors.freshGreen }]}>FREE</Text>
                  </View>
                )}

                {/* Packaging deposit — styled as temporary hold, not a cost */}
                {packagingDeposit > 0 && (
                  <View style={[styles.depositRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.depositLeft}>
                      <MaterialCommunityIcons name="recycle" size={14} color={colors.mutedForeground} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                          Eco-deposit ({listing.packagingType?.replace('_', ' ')})
                        </Text>
                        <Text style={[styles.depositReturn, { color: colors.freshGreen }]}>
                          ↩ Fully refunded when packaging returned
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.summaryValue, { color: colors.mutedForeground }]}>₹{packagingDeposit}</Text>
                  </View>
                )}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* What you actually pay */}
                <View style={styles.summaryRow}>
                  <Text style={[styles.totalLabel, { color: colors.foreground }]}>
                    {packagingDeposit > 0 ? 'You pay now' : 'Total'}
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>₹{grandTotal}</Text>
                </View>

                {packagingDeposit > 0 && (
                  <View style={[styles.netCostRow, { backgroundColor: colors.freshGreenBg }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.freshGreen} />
                    <Text style={[styles.netCostText, { color: colors.freshGreen }]}>
                      Your actual cost after deposit return: ₹{netCost}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Ad placeholder */}
          <View style={[styles.adSlot, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="image-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.adText, { color: colors.mutedForeground }]}>
              Sponsored · East Godavari businesses
            </Text>
            <View style={[styles.adBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.adBadgeText, { color: colors.mutedForeground }]}>Ad</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {isConsumer && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: bottomPad + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.orderBtn, { backgroundColor: savedAddress ? '#072654' : colors.muted }]}
            onPress={handleOrder}
            activeOpacity={0.85}
          >
            {savedAddress && (
              <View style={styles.rzpBtnIcon}>
                <Text style={styles.rzpBtnIconText}>R</Text>
              </View>
            )}
            <Text style={[styles.orderBtnText, { color: savedAddress ? '#fff' : colors.mutedForeground }]}>
              {savedAddress ? `Pay ₹${grandTotal} with Razorpay` : 'Add Address to Order'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {listing && (
        <UPICheckout
          visible={showPayment}
          amount={grandTotal}
          produceName={listing.produceName}
          onSuccess={handlePaymentSuccess}
          onDismiss={() => setShowPayment(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  heroIcon: { width: 120, height: 120, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  category: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  perUnit: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  farmerLoc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  farmerRight: { alignItems: 'flex-end', gap: 6 },
  ratingBlock: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  mapBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  description: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-around',
  },
  infoItem: { alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  infoDivider: { width: 1, marginVertical: 4 },
  orderSection: { gap: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: { fontSize: 18, fontFamily: 'Inter_700Bold', minWidth: 28, textAlign: 'center' },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  addressLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  addressLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  addressText: { fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 },
  changeBtn: { fontSize: 13, fontFamily: 'Inter_600SemiBold', paddingHorizontal: 4 },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addAddressText: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  summary: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  farmPassNudge: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  farmPassActive: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  depositLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  depositReturn: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2 },
  divider: { height: 1 },
  totalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  totalValue: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  netCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  netCostText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 18 },
  adSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  adText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  adBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  orderBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  rzpBtnIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#3395FF', alignItems: 'center', justifyContent: 'center' },
  rzpBtnIconText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  orderBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
