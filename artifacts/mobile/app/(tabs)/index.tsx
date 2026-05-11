import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

import { router } from 'expo-router';

import { ListingCard } from '@/components/ListingCard';
import { LiveFeedBanner } from '@/components/LiveFeedBanner';
import { useApp, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const produceHero = require('../../assets/images/produce_hero.png');

function FarmPassBanner({ hasFarmPass }: { hasFarmPass: boolean }) {
  const colors = useColors();
  if (hasFarmPass) return null;
  return (
    <TouchableOpacity
      style={[styles.farmPassBanner, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40' }]}
      onPress={() => router.push('/farmpass')}
      activeOpacity={0.85}
    >
      <Text style={styles.farmPassEmoji}>🌿</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.farmPassTitle, { color: colors.freshGreen }]}>FarmPass — Free delivery, every order</Text>
        <Text style={[styles.farmPassSub, { color: colors.mutedForeground }]}>₹49/month · 3 orders pays for itself</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.freshGreen} />
    </TouchableOpacity>
  );
}

function AdBanner() {
  const colors = useColors();
  return (
    <View style={[styles.adBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <MaterialCommunityIcons name="image-outline" size={16} color={colors.mutedForeground} />
      <Text style={[styles.adBannerText, { color: colors.mutedForeground }]}>
        Sponsored · Local East Godavari businesses
      </Text>
      <View style={[styles.adTag, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.adTagText, { color: colors.mutedForeground }]}>Ad</Text>
      </View>
    </View>
  );
}

const CATEGORIES: { key: ProduceCategory | 'all'; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'grains', label: 'Rice & Grains', icon: 'grain' },
  { key: 'seafood', label: 'Seafood', icon: 'fish' },
  { key: 'meat', label: 'Meat', icon: 'food-drumstick-outline' },
  { key: 'vegetables', label: 'Veggies', icon: 'carrot' },
  { key: 'fruits', label: 'Fruits', icon: 'fruit-grapes' },
  { key: 'herbs', label: 'Herbs', icon: 'leaf' },
  { key: 'dairy', label: 'Dairy', icon: 'cow' },
  { key: 'other', label: 'More', icon: 'basket' },
];

function getTimeGreeting() {
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
  const [activeCategory, setActiveCategory] = useState<ProduceCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = listings.filter((l) => {
    const matchCat = activeCategory === 'all' || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.produceName.toLowerCase().includes(search.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      l.farmerLocation.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && l.isAvailable;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  // Monthly savings calculation
  const myOrders = getUserOrders().filter((o) => {
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    return o.status === 'delivered' &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();
  });
  // Estimate 35% savings vs retail
  const monthlySavings = Math.round(myOrders.reduce((sum, o) => sum + o.totalPrice * 0.35, 0));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getTimeGreeting()}</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name ?? 'Explorer'}</Text>
          </View>
          <View style={styles.headerRight}>
            {monthlySavings > 0 && (
              <View style={[styles.savingsChip, { backgroundColor: colors.freshGreenBg }]}>
                <MaterialCommunityIcons name="piggy-bank-outline" size={13} color={colors.freshGreen} />
                <Text style={[styles.savingsText, { color: colors.freshGreen }]}>
                  ₹{monthlySavings} saved
                </Text>
              </View>
            )}
            <View style={[styles.locationChip, { backgroundColor: colors.secondary }]}>
              <Feather name="map-pin" size={12} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {currentUser?.location?.split(',')[0] ?? 'Nearby'}
              </Text>
            </View>
          </View>
        </View>

        {/* Live Feed Banner */}
        <LiveFeedBanner />

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search rice, prawns, coconut, turmeric..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveCategory(item.key)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={15}
                  color={isActive ? '#fff' : colors.mutedForeground}
                />
                <Text style={[styles.catLabel, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Image source={produceHero} style={styles.produceHeroImg} contentFit="cover" />
            <FarmPassBanner hasFarmPass={currentUser?.hasFarmPass ?? false} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''} available
            </Text>
            {activeCategory === 'all' && (
              <Text style={[styles.regionLabel, { color: colors.mutedForeground }]}>
                East Godavari & surrounding districts
              </Text>
            )}
          </View>
        }
        ListFooterComponent={<AdBanner />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="basket-off-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No listings found</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },
  savingsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  savingsText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  catList: { paddingRight: 20, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  listHeader: { marginBottom: 12, gap: 10 },
  produceHeroImg: { width: '100%', height: 160, borderRadius: 16, marginBottom: 4 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  regionLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  farmPassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  farmPassEmoji: { fontSize: 24 },
  farmPassTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  farmPassSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  adBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 4,
  },
  adBannerText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  adTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adTagText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
