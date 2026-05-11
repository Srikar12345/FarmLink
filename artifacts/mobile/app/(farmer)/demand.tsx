import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CropRequestCard } from '@/components/CropRequestCard';
import { useApp, type ProduceCategory } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const FILTER_CATEGORIES: { key: ProduceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'fruits', label: 'Fruits' },
  { key: 'grains', label: 'Grains' },
  { key: 'herbs', label: 'Herbs' },
  { key: 'dairy', label: 'Dairy' },
];

export default function FarmerDemand() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getOpenRequests, pledgeToGrow, currentUser } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<ProduceCategory | 'all'>('all');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const allRequests = getOpenRequests();
  const filtered =
    categoryFilter === 'all' ? allRequests : allRequests.filter((r) => r.category === categoryFilter);

  const myPledgedIds = allRequests
    .filter((r) => r.pledgedFarmerIds.includes(currentUser?.id ?? ''))
    .map((r) => r.id);

  const handlePledge = (requestId: string) => {
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return;
    Alert.alert(
      'Pledge to Grow?',
      `You're committing to grow "${req.produceName}" for ${req.requesterName}.\n\n${req.quantityNeeded} ${req.quantityUnit} · ${req.frequency} · ₹${req.maxPricePerUnit}/${req.priceUnit} max price\n\nThey will be notified that you've pledged. This builds trust and secures a buyer before you plant.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pledge to Grow',
          onPress: () => {
            pledgeToGrow(requestId);
            Alert.alert(
              'Pledged!',
              `${req.requesterName} has been notified. They know you'll grow ${req.produceName} for them. This secures your sale before you even plant.`,
            );
          },
        },
      ],
    );
  };

  const totalValue = filtered.reduce((sum, r) => {
    const perUnit = r.maxPricePerUnit;
    const qty = r.frequency === 'weekly' ? r.quantityNeeded * 4 : r.quantityNeeded;
    return sum + perUnit * qty;
  }, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Market Demand</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              What consumers and restaurants near you want to buy — directly from you
            </Text>

            <View style={[styles.insightCard, { backgroundColor: colors.primary, }]}>
              <View style={styles.insightRow}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightNum}>{allRequests.length}</Text>
                  <Text style={styles.insightLabel}>Open requests</Text>
                </View>
                <View style={[styles.insightDivider]} />
                <View style={styles.insightItem}>
                  <Text style={styles.insightNum}>{myPledgedIds.length}</Text>
                  <Text style={styles.insightLabel}>You pledged</Text>
                </View>
                <View style={styles.insightDivider} />
                <View style={styles.insightItem}>
                  <Text style={styles.insightNum}>₹{(totalValue / 1000).toFixed(0)}K+</Text>
                  <Text style={styles.insightLabel}>Potential value</Text>
                </View>
              </View>
              <Text style={styles.insightHint}>
                Pledge to grow = secure your buyer before you plant. No more selling to middlemen at throwaway prices.
              </Text>
            </View>

            <FlatList
              data={FILTER_CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.catList}
              renderItem={({ item }) => {
                const isActive = categoryFilter === item.key;
                return (
                  <TouchableOpacity
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isActive ? colors.farmerColor : colors.card,
                        borderColor: isActive ? colors.farmerColor : colors.border,
                      },
                    ]}
                    onPress={() => setCategoryFilter(item.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catLabel, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {filtered.length > 0 && (
              <Text style={[styles.count, { color: colors.mutedForeground }]}>
                {filtered.length} request{filtered.length !== 1 ? 's' : ''} · tap to pledge and secure your sale
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="chart-bell-curve" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No demand in this category</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Try a different filter, or check back soon as more consumers join FarmLink
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CropRequestCard
            request={item}
            showPledge
            hasAlreadyPledged={myPledgedIds.includes(item.id)}
            onPledge={handlePledge}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 16 },
  insightCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  insightRow: { flexDirection: 'row', alignItems: 'center' },
  insightItem: { flex: 1, alignItems: 'center', gap: 2 },
  insightNum: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  insightLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.75)' },
  insightDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },
  insightHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  catList: { gap: 8, marginBottom: 12 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  count: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 20 },
});
