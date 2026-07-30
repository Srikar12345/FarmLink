import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type Listing, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

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

const CATEGORY_BG: Record<ProduceCategory, string> = {
  vegetables: '#DCFCE7',
  fruits: '#FFEDD5',
  grains: '#FEF3C7',
  dairy: '#DBEAFE',
  herbs: '#EDE9FE',
  seafood: '#CFFAFE',
  meat: '#FEE2E2',
  other: '#F3F4F6',
};

const CATEGORY_COLOR: Record<ProduceCategory, string> = {
  vegetables: '#16A34A',
  fruits: '#EA580C',
  grains: '#B45309',
  dairy: '#2563EB',
  herbs: '#7C3AED',
  seafood: '#0891B2',
  meat: '#DC2626',
  other: '#6B7280',
};

function freshnessLabel(harvestTime: string) {
  const hours = Math.floor((Date.now() - new Date(harvestTime).getTime()) / 3600000);
  if (hours < 1) return { text: 'Just harvested', bg: '#16A34A' };
  if (hours < 12) return { text: `${hours}h fresh`, bg: '#16A34A' };
  if (hours < 24) return { text: `${hours}h ago`, bg: '#D97706' };
  const d = Math.floor(hours / 24);
  return { text: `${d}d ago`, bg: d < 3 ? '#D97706' : '#9CA3AF' };
}

interface Props { listing: Listing }

export function ListingCard({ listing }: Props) {
  const colors = useColors();
  const accent = CATEGORY_COLOR[listing.category];
  const fresh = freshnessLabel(listing.harvestTime);
  const displayName = listing.shortName ?? listing.produceName;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.78}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      {/* Image area */}
      <View style={[styles.imgBox, { backgroundColor: CATEGORY_BG[listing.category] }]}>
        {listing.imageUri ? (
          <Image
            source={typeof listing.imageUri === 'string' ? { uri: listing.imageUri } : listing.imageUri as number}
            style={styles.img}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons name={CATEGORY_ICONS[listing.category]} size={52} color={accent} />
        )}
        <View style={[styles.freshBadge, { backgroundColor: fresh.bg }]}>
          <Text style={styles.freshText}>{fresh.text}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.qtyText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {listing.quantity} {listing.quantityUnit}
        </Text>
        <Text style={[styles.nameText, { color: colors.foreground }]} numberOfLines={2}>
          {displayName}
        </Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.priceText, { color: colors.primary }]}>₹{listing.price}</Text>
            <Text style={[styles.unitText, { color: colors.mutedForeground }]}>/{listing.priceUnit}</Text>
          </View>
          <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  imgBox: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  img: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
  },
  freshBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  freshText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  info: { padding: 10, gap: 3 },
  qtyText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  nameText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  unitText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
