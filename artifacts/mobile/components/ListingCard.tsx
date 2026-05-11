import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type Listing, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { FreshnessTag } from './FreshnessTag';

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
  fruits: '#DC2626',
  grains: '#B45309',
  dairy: '#2563EB',
  herbs: '#7C3AED',
  seafood: '#0891B2',
  meat: '#DC2626',
  other: '#6B7280',
};

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const colors = useColors();
  const iconColor = CATEGORY_COLORS[listing.category];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.75}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
        <MaterialCommunityIcons name={CATEGORY_ICONS[listing.category]} size={36} color={iconColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {listing.produceName}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            ₹{listing.price}
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>/{listing.priceUnit}</Text>
          </Text>
        </View>

        <Text style={[styles.farmer, { color: colors.mutedForeground }]} numberOfLines={1}>
          {listing.farmerName} · {listing.farmerLocation}
        </Text>

        <View style={styles.bottomRow}>
          <FreshnessTag harvestTime={listing.harvestTime} />
          <View style={styles.meta}>
            <Text style={[styles.qty, { color: colors.mutedForeground }]}>
              {listing.quantity} {listing.quantityUnit} left
            </Text>
            {listing.totalReviews > 0 && (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color={colors.starColor} />
                <Text style={[styles.rating, { color: colors.mutedForeground }]}>
                  {listing.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  unit: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  farmer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qty: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});
