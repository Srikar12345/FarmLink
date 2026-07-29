import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type CropRequest, type ProduceCategory, type RequesterType, type RequestFrequency } from '@/context/AppContext';
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

const REQUESTER_ICONS: Record<RequesterType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  home: 'home-outline',
  restaurant: 'silverware-fork-knife',
  business: 'office-building-outline',
};

const REQUESTER_LABELS: Record<RequesterType, string> = {
  home: 'Home Cook',
  restaurant: 'Restaurant',
  business: 'Business',
};

const FREQ_LABELS: Record<RequestFrequency, string> = {
  once: 'One-time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  seasonal: 'Seasonal',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

interface CropRequestCardProps {
  request: CropRequest;
  showPledge?: boolean;
  hasAlreadyPledged?: boolean;
  onPledge?: (id: string) => void;
}

export function CropRequestCard({ request, showPledge, hasAlreadyPledged, onPledge }: CropRequestCardProps) {
  const colors = useColors();
  const iconColor = CATEGORY_COLORS[request.category];
  const isPledged = request.status === 'pledged' || request.pledgedFarmerIds.length > 0;

  const handlePledge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPledge?.(request.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        {request.imageUri ? (
          <Image
            source={typeof request.imageUri === 'string' ? { uri: request.imageUri } : request.imageUri as number}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
            <MaterialCommunityIcons name={CATEGORY_ICONS[request.category]} size={26} color={iconColor} />
          </View>
        )}
        <View style={styles.topContent}>
          <Text style={[styles.produce, { color: colors.foreground }]} numberOfLines={1}>
            {request.produceName}
          </Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name={REQUESTER_ICONS[request.requesterType]} size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {request.requesterName} · {REQUESTER_LABELS[request.requesterType]}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{request.requesterLocation}</Text>
          </View>
        </View>
        <View style={styles.priceBox}>
          <Text style={[styles.price, { color: colors.primary }]}>₹{request.maxPricePerUnit}</Text>
          <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>/{request.priceUnit}</Text>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>max price</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name="package-variant" size={11} color={colors.primary} />
          <Text style={[styles.tagText, { color: colors.primary }]}>
            {request.quantityNeeded} {request.quantityUnit}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name="repeat" size={11} color={colors.primary} />
          <Text style={[styles.tagText, { color: colors.primary }]}>
            {FREQ_LABELS[request.frequency]}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
          <MaterialCommunityIcons name="clock-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
            {timeAgo(request.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {request.description}
      </Text>

      <View style={styles.bottomRow}>
        {isPledged ? (
          <View style={styles.pledgeInfo}>
            <MaterialCommunityIcons name="account-check" size={14} color={colors.freshGreen} />
            <Text style={[styles.pledgeText, { color: colors.freshGreen }]}>
              {request.pledgedFarmerNames.length} farmer{request.pledgedFarmerNames.length !== 1 ? 's' : ''} pledged
              {request.pledgedFarmerNames.length > 0 ? `: ${request.pledgedFarmerNames.slice(0, 2).join(', ')}` : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.pledgeInfo}>
            <MaterialCommunityIcons name="account-question" size={14} color={colors.mutedForeground} />
            <Text style={[styles.pledgeText, { color: colors.mutedForeground }]}>Waiting for farmers</Text>
          </View>
        )}

        {showPledge && !hasAlreadyPledged && (
          <TouchableOpacity
            style={[styles.pledgeBtn, { backgroundColor: colors.primary }]}
            onPress={handlePledge}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="sprout" size={14} color="#fff" />
            <Text style={styles.pledgeBtnText}>Pledge to Grow</Text>
          </TouchableOpacity>
        )}

        {showPledge && hasAlreadyPledged && (
          <View style={[styles.pledgedTag, { backgroundColor: colors.freshGreenBg }]}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.freshGreen} />
            <Text style={[styles.pledgedTagText, { color: colors.freshGreen }]}>You pledged</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    flexShrink: 0,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topContent: { flex: 1, gap: 2 },
  produce: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  priceBox: { alignItems: 'flex-end', gap: 0 },
  price: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  priceUnit: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  priceLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  description: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pledgeInfo: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  pledgeText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  pledgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pledgeBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  pledgedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pledgedTagText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
