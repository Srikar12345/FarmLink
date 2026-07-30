import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type BizType = 'restaurant' | 'canteen' | 'hotel' | 'kirana' | 'cloud_kitchen' | 'catering';

const BIZ_TYPES: { key: BizType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'restaurant', label: 'Restaurant', icon: 'silverware-fork-knife' },
  { key: 'canteen', label: 'Canteen', icon: 'food-variant' },
  { key: 'hotel', label: 'Hotel', icon: 'office-building-outline' },
  { key: 'kirana', label: 'Kirana', icon: 'store-outline' },
  { key: 'cloud_kitchen', label: 'Cloud Kitchen', icon: 'chef-hat' },
  { key: 'catering', label: 'Catering', icon: 'pot-steam-outline' },
];

const WHY_FARMLINK = [
  { icon: 'percent-circle-outline', color: '#16A34A', title: '0% Commission', desc: 'Every rupee you pay goes directly to the farmer — no platform cut, ever.' },
  { icon: 'truck-fast-outline', color: '#2563EB', title: 'Scheduled Delivery', desc: 'Daily or weekly deliveries timed to your kitchen prep hours.' },
  { icon: 'leaf', color: '#7C3AED', title: 'Farm Gate Pricing', desc: 'Wholesale prices 25–40% below retail market rates.' },
  { icon: 'certificate-outline', color: '#EA580C', title: 'Verified Freshness', desc: 'Harvest-to-delivery traceability. Know exactly which farm your produce came from.' },
];

const SAMPLE_BULK: {
  id: string;
  name: string;
  category: ProduceCategory;
  priceRetail: number;
  priceBulk: number;
  unit: string;
  moq: number;
  farmerName: string;
  savings: number;
  imageUri?: number;
}[] = [
  {
    id: 'b1',
    name: 'Sona Masuri Rice',
    category: 'grains',
    priceRetail: 72,
    priceBulk: 48,
    unit: 'kg',
    moq: 25,
    farmerName: 'Ravi Shankar',
    savings: 33,
    imageUri: require('../../assets/images/listing_sona_masuri_rice.jpg'),
  },
  {
    id: 'b2',
    name: 'Godavari Tiger Prawns',
    category: 'seafood',
    priceRetail: 850,
    priceBulk: 610,
    unit: 'kg',
    moq: 5,
    farmerName: 'Suresh Babu',
    savings: 28,
    imageUri: require('../../assets/images/listing_tiger_prawns.jpg'),
  },
  {
    id: 'b3',
    name: 'Raw Turmeric Fingers',
    category: 'herbs',
    priceRetail: 120,
    priceBulk: 75,
    unit: 'kg',
    moq: 10,
    farmerName: 'Lakshmi Devi',
    savings: 38,
    imageUri: require('../../assets/images/listing_raw_turmeric.jpg'),
  },
  {
    id: 'b4',
    name: 'BPT Boiled Rice',
    category: 'grains',
    priceRetail: 68,
    priceBulk: 44,
    unit: 'kg',
    moq: 50,
    farmerName: 'Venkata Rao',
    savings: 35,
    imageUri: require('../../assets/images/listing_bpt_boiled_rice.jpg'),
  },
];

const CAT_COLOR: Record<ProduceCategory, string> = {
  vegetables: '#16A34A', fruits: '#EA580C', grains: '#B45309',
  dairy: '#2563EB', herbs: '#7C3AED', seafood: '#0891B2',
  meat: '#DC2626', other: '#6B7280',
};
const CAT_BG: Record<ProduceCategory, string> = {
  vegetables: '#DCFCE7', fruits: '#FFEDD5', grains: '#FEF3C7',
  dairy: '#DBEAFE', herbs: '#EDE9FE', seafood: '#CFFAFE',
  meat: '#FEE2E2', other: '#F3F4F6',
};

function BulkCard({ item }: { item: typeof SAMPLE_BULK[0] }) {
  const colors = useColors();
  const accent = CAT_COLOR[item.category];

  const handleEnquire = () => {
    Alert.alert(
      `Enquire — ${item.name}`,
      `Minimum order: ${item.moq} ${item.unit}\nFarm price: ₹${item.priceBulk}/${item.unit}\nFarmer: ${item.farmerName}\n\nWe'll connect you directly with the farmer for bulk negotiation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'WhatsApp Farmer',
          onPress: () =>
            Linking.openURL(
              `https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20bulk%20order%20of%20${encodeURIComponent(item.name)}%20(${item.moq}%20${item.unit}%20min)%20from%20FarmLink%20B2B.`,
            ),
        },
      ],
    );
  };

  return (
    <View style={[styles.bulkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.bulkImg, { backgroundColor: CAT_BG[item.category] }]}>
        {item.imageUri ? (
          <Image source={item.imageUri} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name="leaf" size={40} color={accent} />
        )}
        <View style={[styles.savingsBadge, { backgroundColor: '#16A34A' }]}>
          <Text style={styles.savingsText}>{item.savings}% off MRP</Text>
        </View>
      </View>
      <View style={styles.bulkInfo}>
        <Text style={[styles.bulkName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.bulkFarmer, { color: colors.mutedForeground }]}>
          <Feather name="user" size={11} /> {item.farmerName} · 0% commission
        </Text>
        <View style={styles.priceBlock}>
          <View>
            <Text style={[styles.bulkPrice, { color: accent }]}>
              ₹{item.priceBulk}<Text style={[styles.bulkUnit, { color: colors.mutedForeground }]}>/{item.unit}</Text>
            </Text>
            <Text style={[styles.retailStrike, { color: colors.mutedForeground }]}>
              MRP ₹{item.priceRetail}/{item.unit}
            </Text>
          </View>
          <View>
            <Text style={[styles.moqLabel, { color: colors.mutedForeground }]}>Min order</Text>
            <Text style={[styles.moqVal, { color: colors.foreground }]}>{item.moq} {item.unit}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.enquireBtn, { backgroundColor: accent }]}
          onPress={handleEnquire}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="whatsapp" size={15} color="#fff" />
          <Text style={styles.enquireBtnText}>Enquire / Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function B2BScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { listings } = useApp();
  const [selectedBiz, setSelectedBiz] = useState<BizType | null>(null);
  const [search, setSearch] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filteredBulk = SAMPLE_BULK.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredBulk}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: '#052E16' }]}>
              <View style={[styles.heroChip, { backgroundColor: '#16A34A' }]}>
                <Text style={styles.heroChipText}>ZERO COMMISSION · NAMMA YATRI MODEL</Text>
              </View>
              <Text style={styles.heroTitle}>FarmLink B2B</Text>
              <Text style={styles.heroSub}>
                Restaurants · Hotels · Canteens · Kiranas{'\n'}
                Buy direct from farm. Pay the farmer. Save 25–40%.
              </Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() =>
                  Linking.openURL('https://wa.me/919876543210?text=Hi%2C%20I%27d%20like%20to%20set%20up%20a%20FarmLink%20B2B%20account%20for%20my%20business.')
                }
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
                <Text style={styles.heroBtnText}>Get B2B Account</Text>
              </TouchableOpacity>
            </View>

            {/* Business type selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionHead, { color: colors.foreground }]}>I run a…</Text>
              <View style={styles.bizGrid}>
                {BIZ_TYPES.map((b) => {
                  const active = selectedBiz === b.key;
                  return (
                    <TouchableOpacity
                      key={b.key}
                      style={[
                        styles.bizChip,
                        {
                          backgroundColor: active ? colors.primary : colors.card,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedBiz(active ? null : b.key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={b.icon}
                        size={18}
                        color={active ? '#fff' : colors.mutedForeground}
                      />
                      <Text style={[styles.bizChipText, { color: active ? '#fff' : colors.foreground }]}>
                        {b.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Why FarmLink B2B */}
            <View style={styles.section}>
              <Text style={[styles.sectionHead, { color: colors.foreground }]}>Why FarmLink B2B?</Text>
              <View style={styles.whyGrid}>
                {WHY_FARMLINK.map((w) => (
                  <View
                    key={w.title}
                    style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name={w.icon as any} size={28} color={w.color} />
                    <Text style={[styles.whyTitle, { color: colors.foreground }]}>{w.title}</Text>
                    <Text style={[styles.whyDesc, { color: colors.mutedForeground }]}>{w.desc}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Vending machine note */}
            <TouchableOpacity
              style={[styles.machineCard, { backgroundColor: '#0C4A6E', borderColor: '#0369A1' }]}
              onPress={() => router.push('/machines' as any)}
              activeOpacity={0.9}
            >
              <View style={styles.machineLeft}>
                <Text style={styles.machineIcon}>🏧</Text>
                <View>
                  <Text style={styles.machineTitle}>FarmLink Vending Machines</Text>
                  <Text style={styles.machineSub}>Solar-powered · Temperature-controlled · At your apartment parking</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#7DD3FC" />
            </TouchableOpacity>

            {/* Search */}
            <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search bulk produce…"
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <Text style={[styles.sectionHead, { color: colors.foreground, marginBottom: 0 }]}>
              Wholesale Listings
            </Text>
          </View>
        }
        renderItem={({ item }) => <BulkCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify-close" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results for "{search}"</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16 },
  headerContent: { gap: 20, marginBottom: 16 },

  /* hero */
  hero: { borderRadius: 20, padding: 20, gap: 10 },
  heroChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroChipText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.8 },
  heroTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' },
  heroSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#BBF7D0', lineHeight: 20 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: '#16A34A', borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  heroBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  /* section */
  section: { gap: 12 },
  sectionHead: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 4 },

  /* biz chips */
  bizGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bizChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 24, borderWidth: 1,
  },
  bizChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  /* why cards */
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: {
    width: '47%', borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 6,
  },
  whyTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  whyDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },

  /* machine card */
  machineCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 12,
  },
  machineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  machineIcon: { fontSize: 32 },
  machineTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#E0F2FE' },
  machineSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#7DD3FC', marginTop: 2 },

  /* search */
  search: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 11, gap: 9,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },

  /* bulk card */
  bulkCard: {
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  bulkImg: {
    width: '100%', height: 150,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  savingsText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#fff' },
  bulkInfo: { padding: 14, gap: 6 },
  bulkName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  bulkFarmer: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  priceBlock: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginTop: 4,
  },
  bulkPrice: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  bulkUnit: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  retailStrike: { fontSize: 12, fontFamily: 'Inter_400Regular', textDecorationLine: 'line-through' },
  moqLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'right' },
  moqVal: { fontSize: 14, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  enquireBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 12, marginTop: 4,
  },
  enquireBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
