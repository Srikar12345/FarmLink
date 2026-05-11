import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FreshnessTag } from '@/components/FreshnessTag';
import { useApp, type Listing, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

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

function MyListingCard({ listing }: { listing: Listing }) {
  const colors = useColors();
  const iconColor = CATEGORY_COLORS[listing.category];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.cardIcon, { backgroundColor: iconColor + '18' }]}>
        <MaterialCommunityIcons name={CATEGORY_ICONS[listing.category]} size={28} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardName, { color: colors.foreground }]}>{listing.produceName}</Text>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>
            ₹{listing.price}/{listing.priceUnit}
          </Text>
        </View>
        <Text style={[styles.cardQty, { color: colors.mutedForeground }]}>
          {listing.quantity} {listing.quantityUnit} available
        </Text>
        <FreshnessTag harvestTime={listing.harvestTime} />
      </View>
      <View style={[styles.activeDot, { backgroundColor: listing.isAvailable ? colors.freshGreen : colors.mutedForeground }]} />
    </View>
  );
}

export default function FarmerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, getFarmerListings, getFarmerOrders, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/phone');
  };
  const myListings = getFarmerListings();
  const myOrders = getFarmerOrders();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const pendingOrders = myOrders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered').length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Farmer Dashboard</Text>
                <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name}</Text>
                {currentUser?.location && (
                  <View style={styles.locRow}>
                    <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.loc, { color: colors.mutedForeground }]}>{currentUser.location}</Text>
                  </View>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.logoutBtn,
                  { borderColor: colors.destructive + '50', backgroundColor: colors.destructive + '08', opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons name="logout" size={15} color={colors.destructive} />
                <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{myListings.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Listings</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.accent }]}>{pendingOrders}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.freshGreen }]}>{deliveredOrders}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Delivered</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Listings</Text>
              <TouchableOpacity onPress={() => router.push('/(farmer)/add')} activeOpacity={0.8}>
                <Text style={[styles.addBtn, { color: colors.primary }]}>+ Add New</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="sprout" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No listings yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Start by adding your first produce listing
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(farmer)/add')}
              activeOpacity={0.85}
            >
              <Text style={[styles.emptyBtnText, { color: '#fff' }]}>Add First Listing</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <MyListingCard listing={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  greeting: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  loc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statNum: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  addBtn: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1 },
  cardPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  cardQty: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  activeDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  emptyBtn: { marginTop: 8, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
