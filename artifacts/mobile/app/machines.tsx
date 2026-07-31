import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp, type VendingMachine } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type Filter = VendingMachine['status'] | 'all';

const STATUS = {
  online: { label: 'Fresh & stocked', color: '#16A34A', bg: '#DCFCE7' },
  low: { label: 'Smart restock queued', color: '#D97706', bg: '#FEF3C7' },
  restocking: { label: 'Restocking now', color: '#2563EB', bg: '#DBEAFE' },
};

function hoursUntil(iso: string) {
  return Math.max(1, Math.ceil((new Date(iso).getTime() - Date.now()) / 3600000));
}

function MachineCard({ machine }: { machine: VendingMachine }) {
  const colors = useColors();
  const { restockMachine, currentUser } = useApp();
  const config = STATUS[machine.status];
  const stock = machine.batches.reduce((sum, batch) => sum + batch.quantity, 0);
  const capacity = machine.batches.reduce((sum, batch) => sum + batch.capacity, 0);
  const stockPct = Math.round((stock / Math.max(capacity, 1)) * 100);
  const expiryHours = Math.min(...machine.batches.map((batch) => Math.max(0, Math.ceil((new Date(batch.expiresAt).getTime() - Date.now()) / 3600000))));

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.location}>
          <Text style={styles.machineEmoji}>🏧</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.machineName, { color: colors.foreground }]}>{machine.apartment}</Text>
            <Text style={[styles.machineArea, { color: colors.mutedForeground }]}>{machine.area}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={[styles.status, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.distance, { color: colors.primary }]}>{machine.distance}</Text>
        </View>
      </View>

      <View style={[styles.hygienePanel, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <MaterialCommunityIcons name="shield-check-outline" size={20} color="#16A34A" />
        <View style={{ flex: 1 }}>
          <Text style={styles.hygieneTitle}>Hygiene verified · {machine.hygieneScore}/100</Text>
          <Text style={styles.hygieneText}>Temperature monitored · Sanitised today · FEFO rotation active</Text>
        </View>
      </View>

      <View style={styles.stockTop}>
        <Text style={[styles.stockTitle, { color: colors.foreground }]}>Live stock {stock}/{capacity}</Text>
        <Text style={[styles.restockEta, { color: colors.primary }]}>Next smart restock ~{hoursUntil(machine.nextRestockAt)}h</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${stockPct}%`, backgroundColor: stockPct > 40 ? '#16A34A' : '#D97706' }]} />
      </View>

      <View style={styles.batchList}>
        {machine.batches.map((batch) => (
          <View key={batch.id} style={[styles.batch, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.batchName, { color: colors.foreground }]}>{batch.produceName}</Text>
              <Text style={[styles.batchInfo, { color: colors.mutedForeground }]}>
                {batch.quantity}/{batch.capacity} left · packed {new Date(batch.packedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
            <View style={[styles.tempBadge, { backgroundColor: batch.temperatureOk ? '#DCFCE7' : '#FEE2E2' }]}>
              <MaterialCommunityIcons name="thermometer" size={13} color={batch.temperatureOk ? '#16A34A' : '#DC2626'} />
              <Text style={[styles.tempText, { color: batch.temperatureOk ? '#16A34A' : '#DC2626' }]}>{batch.temperature}°C</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footerStats}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>☀️ Solar powered</Text>
        <Text style={[styles.footerText, { color: expiryHours < 24 ? '#D97706' : colors.mutedForeground }]}>⏱ Freshest batch {expiryHours}h window</Text>
      </View>
      {currentUser?.role === 'farmer' && (
        <TouchableOpacity style={[styles.restockButton, { backgroundColor: colors.primary }]} onPress={() => restockMachine(machine.id)}>
          <MaterialCommunityIcons name="package-variant-closed-check" size={16} color="#fff" />
          <Text style={styles.restockButtonText}>Complete hygiene check & restock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MachinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { machines } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const shown = machines.filter((machine) => filter === 'all' || machine.status === filter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 12, paddingBottom: 110 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.foreground} /></TouchableOpacity>
              <View>
                <Text style={[styles.title, { color: colors.foreground }]}>Fresh Stations</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Micro dark stores with no rent or middleman</Text>
              </View>
            </View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Freshness is operational, not a promise.</Text>
              <Text style={styles.heroText}>Demand forecasts refresh stock every 6–12 hours. Every batch is hygiene-checked, temperature monitored, and sold first by earliest expiry.</Text>
            </View>
            <View style={styles.filters}>
              {(['all', 'online', 'low', 'restocking'] as Filter[]).map((key) => (
                <TouchableOpacity key={key} onPress={() => setFilter(key)} style={[styles.filter, { borderColor: filter === key ? colors.primary : colors.border, backgroundColor: filter === key ? colors.primary : colors.card }]}>
                  <Text style={[styles.filterText, { color: filter === key ? '#fff' : colors.foreground }]}>{key === 'all' ? 'All stations' : STATUS[key].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => <MachineCard machine={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, list: { paddingHorizontal: 16 }, header: { gap: 16, marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 }, title: { fontSize: 22, fontFamily: 'Inter_700Bold' }, subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  hero: { backgroundColor: '#052E16', borderRadius: 18, padding: 17 }, heroTitle: { color: '#F0FDF4', fontSize: 16, fontFamily: 'Inter_700Bold' }, heroText: { color: '#BBF7D0', fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: 6 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 }, filterText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 11 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, location: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, machineEmoji: { fontSize: 30 }, machineName: { fontSize: 15, fontFamily: 'Inter_700Bold' }, machineArea: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }, status: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 }, statusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' }, distance: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  hygienePanel: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 11, borderWidth: 1 }, hygieneTitle: { color: '#166534', fontSize: 12, fontFamily: 'Inter_700Bold' }, hygieneText: { color: '#15803D', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  stockTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, stockTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' }, restockEta: { fontSize: 11, fontFamily: 'Inter_600SemiBold' }, track: { height: 6, borderRadius: 10, overflow: 'hidden' }, fill: { height: 6, borderRadius: 10 },
  batchList: { gap: 7 }, batch: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 8, gap: 8 }, batchName: { fontSize: 12, fontFamily: 'Inter_600SemiBold' }, batchInfo: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 }, tempBadge: { flexDirection: 'row', gap: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12 }, tempText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  footerStats: { flexDirection: 'row', justifyContent: 'space-between' }, footerText: { fontSize: 10, fontFamily: 'Inter_400Regular' }, restockButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, padding: 11, borderRadius: 11 }, restockButtonText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});