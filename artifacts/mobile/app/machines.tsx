import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

type MachineStatus = 'online' | 'low' | 'restocking';

interface VendingMachine {
  id: string;
  name: string;
  apartment: string;
  area: string;
  distance: string;
  status: MachineStatus;
  slots: number;
  availableSlots: number;
  items: string[];
  solar: boolean;
  tempControlled: boolean;
  lastRestocked: string;
}

const MACHINES: VendingMachine[] = [
  {
    id: 'm1',
    name: 'FL-001',
    apartment: 'Sai Residency',
    area: 'Kakinada Road, Block B Parking',
    distance: '0.2 km',
    status: 'online',
    slots: 20,
    availableSlots: 14,
    items: ['Rice', 'Coconuts', 'Turmeric', 'Bananas'],
    solar: true,
    tempControlled: true,
    lastRestocked: '6 hours ago',
  },
  {
    id: 'm2',
    name: 'FL-002',
    apartment: 'Vijaya Towers',
    area: 'Rajahmundry Bypass, Lift Lobby',
    distance: '0.5 km',
    status: 'online',
    slots: 20,
    availableSlots: 8,
    items: ['Prawns', 'Rice', 'Bananas', 'Herbs'],
    solar: true,
    tempControlled: true,
    lastRestocked: '2 hours ago',
  },
  {
    id: 'm3',
    name: 'FL-003',
    apartment: 'Green Valley Apts',
    area: 'Sithanagaram, Ground Floor Parking',
    distance: '1.1 km',
    status: 'low',
    slots: 20,
    availableSlots: 3,
    items: ['Coconuts', 'Rice'],
    solar: true,
    tempControlled: true,
    lastRestocked: '18 hours ago',
  },
  {
    id: 'm4',
    name: 'FL-004',
    apartment: 'Lakshmi Gardens',
    area: 'Peddapuram Road, Lift Area',
    distance: '1.8 km',
    status: 'restocking',
    slots: 20,
    availableSlots: 0,
    items: [],
    solar: true,
    tempControlled: true,
    lastRestocked: 'In progress',
  },
];

const STATUS_CONFIG: Record<MachineStatus, { label: string; color: string; bg: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  online: { label: 'Stocked', color: '#16A34A', bg: '#DCFCE7', icon: 'check-circle-outline' },
  low: { label: 'Running Low', color: '#D97706', bg: '#FEF3C7', icon: 'alert-circle-outline' },
  restocking: { label: 'Restocking', color: '#2563EB', bg: '#DBEAFE', icon: 'refresh' },
};

function MachineCard({ machine }: { machine: VendingMachine }) {
  const colors = useColors();
  const st = STATUS_CONFIG[machine.status];
  const fillPct = (machine.availableSlots / machine.slots) * 100;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.machineIdRow}>
          <Text style={{ fontSize: 32 }}>🏧</Text>
          <View>
            <Text style={[styles.machineName, { color: colors.foreground }]}>{machine.apartment}</Text>
            <Text style={[styles.machineArea, { color: colors.mutedForeground }]}>{machine.area}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <MaterialCommunityIcons name={st.icon} size={13} color={st.color} />
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <Text style={[styles.distText, { color: colors.primary }]}>{machine.distance}</Text>
        </View>
      </View>

      {/* Fill bar */}
      <View style={styles.fillBarTrack}>
        <View style={[styles.fillBarFill, {
          width: `${fillPct}%` as any,
          backgroundColor: fillPct > 50 ? '#16A34A' : fillPct > 20 ? '#D97706' : '#DC2626',
        }]} />
      </View>
      <Text style={[styles.fillLabel, { color: colors.mutedForeground }]}>
        {machine.availableSlots}/{machine.slots} slots available · Restocked {machine.lastRestocked}
      </Text>

      {/* Items */}
      {machine.items.length > 0 && (
        <View style={styles.itemsRow}>
          {machine.items.map((item) => (
            <View key={item} style={[styles.itemChip, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.itemChipText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <MaterialCommunityIcons name="solar-panel" size={14} color="#F59E0B" />
          <Text style={[styles.featureText, { color: colors.mutedForeground }]}>Solar powered</Text>
        </View>
        <View style={styles.feature}>
          <MaterialCommunityIcons name="snowflake" size={14} color="#2563EB" />
          <Text style={[styles.featureText, { color: colors.mutedForeground }]}>Temp controlled</Text>
        </View>
        <View style={styles.feature}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.primary} />
          <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{machine.id}</Text>
        </View>
      </View>

      {machine.status !== 'restocking' && (
        <TouchableOpacity
          style={[styles.goBtn, { borderColor: colors.border }]}
          onPress={() => router.push('/(tabs)' as any)}
          activeOpacity={0.8}
        >
          <Feather name="navigation" size={14} color={colors.primary} />
          <Text style={[styles.goBtnText, { color: colors.primary }]}>Get Directions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MachinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const [filter, setFilter] = useState<MachineStatus | 'all'>('all');

  const filtered = MACHINES.filter((m) => filter === 'all' || m.status === filter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.list, { paddingTop: topPad + 16, paddingBottom: 110 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Back + title */}
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Feather name="arrow-left" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <View>
                <Text style={[styles.title, { color: colors.foreground }]}>Nearby Machines</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  FarmLink micro dark stores — no rent, no lease
                </Text>
              </View>
            </View>

            {/* Explainer */}
            <View style={[styles.explainer, { backgroundColor: '#052E16', borderColor: '#16A34A40' }]}>
              <Text style={styles.explainerTitle}>🏧 How FarmLink Machines Work</Text>
              <Text style={styles.explainerText}>
                Solar-powered, temperature-controlled vending units installed at apartment parking lots and lift lobbies.
                {'\n\n'}Farmers restock directly — produce goes from farm to your building overnight.
                No shop. No rent. No middleman.
                {'\n\n'}Walk down, scan QR, take fresh produce. Pay directly to farmer via UPI.
              </Text>
            </View>

            {/* Stats bar */}
            <View style={styles.statsBar}>
              {[
                { label: 'Machines', value: '4', icon: '🏧' },
                { label: 'Apartments', value: '4', icon: '🏢' },
                { label: 'Zero rent', value: '₹0', icon: '🏷️' },
                { label: 'Solar', value: '100%', icon: '☀️' },
              ].map((s) => (
                <View key={s.label} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.statEmoji}>{s.icon}</Text>
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
              {[
                { key: 'all' as const, label: 'All' },
                { key: 'online' as const, label: '🟢 Stocked' },
                { key: 'low' as const, label: '🟡 Low' },
                { key: 'restocking' as const, label: '🔵 Restocking' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filter === f.key ? colors.primary : colors.card,
                      borderColor: filter === f.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, { color: filter === f.key ? '#fff' : colors.foreground }]}>
                    {f.label}
                  </Text>
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
  root: { flex: 1 },
  list: { paddingHorizontal: 16 },
  headerArea: { gap: 16, marginBottom: 16 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },

  explainer: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  explainerTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#86EFAC', marginBottom: 4 },
  explainerText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#BBF7D0', lineHeight: 20 },

  statsBar: { flexDirection: 'row', gap: 8 },
  statItem: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 10, alignItems: 'center', gap: 2,
  },
  statEmoji: { fontSize: 18 },
  statVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  /* machine card */
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  machineIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  machineName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  machineArea: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  distText: { fontSize: 13, fontFamily: 'Inter_700Bold' },

  fillBarTrack: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden' },
  fillBarFill: { height: '100%', borderRadius: 10 },
  fillLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  itemChipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  features: { flexDirection: 'row', gap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureText: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  goBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderRadius: 10, borderWidth: 1, paddingVertical: 10,
  },
  goBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
