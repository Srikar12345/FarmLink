import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/ListingCard';
import { LiveFeedBanner } from '@/components/LiveFeedBanner';
import { useApp, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type CatKey = ProduceCategory | 'all';

const CATEGORIES: {
  key: CatKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bg: string;
}[] = [
  { key: 'all',        label: 'All',         icon: 'apps',                   color: '#1B8A3C', bg: '#DCFCE7' },
  { key: 'grains',     label: 'Rice &\nGrains', icon: 'grain',               color: '#B45309', bg: '#FEF3C7' },
  { key: 'seafood',    label: 'Seafood',      icon: 'fish',                   color: '#0891B2', bg: '#CFFAFE' },
  { key: 'vegetables', label: 'Veggies',      icon: 'carrot',                 color: '#16A34A', bg: '#DCFCE7' },
  { key: 'fruits',     label: 'Fruits',       icon: 'fruit-grapes',           color: '#EA580C', bg: '#FFEDD5' },
  { key: 'herbs',      label: 'Herbs &\nSpices', icon: 'leaf',               color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'dairy',      label: 'Dairy',        icon: 'cow',                    color: '#2563EB', bg: '#DBEAFE' },
  { key: 'other',      label: 'More',         icon: 'basket',                 color: '#6B7280', bg: '#F3F4F6' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ConsumerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { listings, currentUser, getUserOrders } = useApp();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CatKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = listings.filter((l) => {
    const matchCat = activeCategory === 'all' || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.produceName.toLowerCase().includes(search.toLowerCase()) ||
      (l.shortName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      l.farmerLocation.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && l.isAvailable;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const monthlySavings = Math.round(
    getUserOrders()
      .filter((o) => {
        const d = new Date(o.createdAt);
        const n = new Date();
        return o.status === 'delivered' && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      })
      .reduce((s, o) => s + o.totalPrice * 0.35, 0),
  );

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Fixed Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.background }]}>
        {/* Top bar: delivery + chips */}
        <View style={styles.topBar}>
              <View style={styles.deliveryRow}>
                <MaterialCommunityIcons name="storefront-outline" size={15} color={colors.primary} />
            <View>
                  <Text style={[styles.deliverySmall, { color: colors.mutedForeground }]}>Fresh near you</Text>
                  <Text style={[styles.deliveryBig, { color: colors.foreground }]}>Station pickup first</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {monthlySavings > 0 && (
              <View style={[styles.chip, { backgroundColor: colors.freshGreenBg }]}>
                <MaterialCommunityIcons name="piggy-bank-outline" size={12} color={colors.freshGreen} />
                <Text style={[styles.chipText, { color: colors.freshGreen }]}>₹{monthlySavings} saved</Text>
              </View>
            )}
            <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
              <Feather name="map-pin" size={11} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.primary }]}>
                {currentUser?.location?.split(',')[0] ?? 'Nearby'}
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search rice, prawns, coconuts, turmeric…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <LiveFeedBanner />

            <TouchableOpacity
              style={[styles.machineHero, { backgroundColor: '#052E16' }]}
              onPress={() => router.push('/machines' as any)}
              activeOpacity={0.88}
            >
              <Text style={styles.machineEmoji}>🏧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.machineHeroTitle}>Fresh near you — 6–12h replenishment</Text>
                <Text style={styles.machineHeroSub}>Hygiene-checked micro store · Pick up with ₹0 delivery fee</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#86EFAC" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.basketHero, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => router.push('/baskets' as any)}
              activeOpacity={0.88}
            >
              <Text style={{ fontSize: 25 }}>🥬</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.basketHeroTitle, { color: colors.foreground }]}>Freshness Plans</Text>
                <Text style={[styles.basketHeroSub, { color: colors.mutedForeground }]}>Weekly baskets help us stock exactly what your building needs</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* FarmPass nudge */}
            {!currentUser?.hasFarmPass && (
              <TouchableOpacity
                style={[styles.farmPass, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '50' }]}
                onPress={() => router.push('/farmpass')}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 22 }}>🌿</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.farmPassTitle, { color: colors.freshGreen }]}>
                    FarmPass — Free eligible delivery
                  </Text>
                  <Text style={[styles.farmPassSub, { color: colors.mutedForeground }]}>
                    ₹49/month · ₹199+ home orders · pickup always free
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={17} color={colors.freshGreen} />
              </TouchableOpacity>
            )}

            {/* ── Category grid ── */}
            <View>
              <Text style={[styles.sectionHead, { color: colors.foreground }]}>Shop by Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => {
                  const active = activeCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.catTile,
                        { backgroundColor: active ? cat.color : cat.bg },
                      ]}
                      onPress={() => setActiveCategory(cat.key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={26}
                        color={active ? '#fff' : cat.color}
                      />
                      <Text
                        style={[styles.catLabel, { color: active ? '#fff' : cat.color }]}
                        numberOfLines={2}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Products section header */}
            <View style={styles.productsBar}>
              <Text style={[styles.sectionHead, { color: colors.foreground }]}>
                {activeCategory === 'all' ? 'All Products' : activeCat?.label.replace('\n', ' ')}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>
                  {filtered.length} items
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="basket-off-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing here yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Try a different category or check back soon
            </Text>
          </View>
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* header */
  header: { paddingHorizontal: 16, paddingBottom: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  deliverySmall: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  deliveryBig: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  chipRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  chipText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  /* search */
  search: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 13, paddingVertical: 11, gap: 9,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },

  /* list */
  listContent: { paddingHorizontal: 16, paddingBottom: 110 },
  row: { gap: 10, marginBottom: 10 },
  listHeader: { gap: 18, marginBottom: 6 },

  /* farmpass */
  farmPass: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 13, borderRadius: 14, borderWidth: 1,
  },
  machineHero: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16 },
  machineEmoji: { fontSize: 28 },
  machineHeroTitle: { color: '#F0FDF4', fontSize: 13, fontFamily: 'Inter_700Bold' },
  machineHeroSub: { color: '#86EFAC', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  basketHero: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1 },
  basketHeroTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  basketHeroSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  farmPassTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  farmPassSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },

  /* categories */
  sectionHead: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catTile: {
    width: '22.5%',
    aspectRatio: 0.88,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 8,
  },
  catLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'center', lineHeight: 13 },

  /* products bar */
  productsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  /* empty */
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
