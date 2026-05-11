import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import { PACKAGING_INFO, type PackagingType } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

interface Step {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  title: string;
  desc: string;
}

const PROCESS_STEPS: Step[] = [
  {
    icon: 'sprout',
    color: '#16A34A',
    title: '1. Harvest your paddy / raw produce',
    desc: 'Harvest as you normally would. Store safely to avoid moisture damage. Raw paddy cannot be directly sold — it must be milled first.',
  },
  {
    icon: 'cog',
    color: '#B45309',
    title: '2. Take it to your local mill',
    desc: 'Rice mills exist in every mandal of East Godavari. Pay the standard milling fee (₹1–2/kg). The mill converts paddy to polished rice. You keep the rice — the husk is theirs.',
  },
  {
    icon: 'bag-personal',
    color: '#7C3AED',
    title: '3. Pack in eco-packaging',
    desc: 'Weigh your rice. Pack in jute bags (best for rice). Seal properly. Label with your name, harvest date, and grade. FarmLink provides jute bag templates.',
  },
  {
    icon: 'store',
    color: '#2563EB',
    title: '4. List on FarmLink',
    desc: 'Add your listing with processing details (which mill, when). Consumers can see exactly where their rice came from and how it was processed.',
  },
  {
    icon: 'truck-delivery',
    color: '#DC2626',
    title: '5. Rider picks up & delivers',
    desc: 'A verified FarmLink rider comes to your doorstep, collects the packed rice, and delivers to the customer. You get paid the same day.',
  },
  {
    icon: 'recycle',
    color: '#16A34A',
    title: '6. Packaging returns to you',
    desc: 'Rider collects the empty jute bag on the next delivery trip. You get your bag back — reuse it for the next batch. No packaging cost wasted.',
  },
];

const LOCAL_MILLS = [
  { name: 'Rajam Rice Mill', location: 'Kakinada Road, Razole', produces: 'Sona Masuri, BPT, HMT', fee: '₹1.5/kg' },
  { name: 'Pattabhi Rice Mill', location: 'Amalapuram', produces: 'BPT Boiled, Paraboiled', fee: '₹2/kg' },
  { name: 'Sri Rama Oil Mill', location: 'Rajamahendravaram', produces: 'Coconut oil, Groundnut oil', fee: '₹25/litre' },
  { name: 'Godavari Dal Mill', location: 'Kakinada', produces: 'Urad dal, Chana dal, Moong dal', fee: '₹3/kg' },
  { name: 'Spice Processing Unit', location: 'Rajam', produces: 'Dry turmeric, Chilli powder', fee: '₹5/kg' },
];

const PACKAGING_ORDER: PackagingType[] = ['jute_bag', 'cloth_bag', 'glass_jar', 'steel_tin', 'leaf_basket', 'paper_bag'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ProcessingGuideModal({ visible, onClose }: Props) {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'guide' | 'mills' | 'packaging'>('guide');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>FarmLink Selling Guide</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>East Godavari, Andhra Pradesh</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {([['guide', 'How it works'], ['mills', 'Local Mills'], ['packaging', 'Packaging']] as const).map(([t, label]) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, { color: activeTab === t ? colors.foreground : colors.mutedForeground }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'guide' && (
            <View style={styles.section}>
              <View style={[styles.infoCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.primary }]}>You don't need to buy any equipment</Text>
                  <Text style={[styles.infoDesc, { color: colors.foreground }]}>
                    Every mandal in East Godavari already has rice mills, oil mills, and processing units. Use them exactly as you always have — just list the processed product on FarmLink instead of selling to a middleman.
                  </Text>
                </View>
              </View>

              {PROCESS_STEPS.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepIcon, { backgroundColor: step.color + '15' }]}>
                    <MaterialCommunityIcons name={step.icon} size={22} color={step.color} />
                  </View>
                  {i < PROCESS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                  )}
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                    <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}

              <View style={[styles.earningsCard, { backgroundColor: colors.farmerColor + '10', borderColor: colors.farmerColor + '30' }]}>
                <Text style={[styles.earningsTitle, { color: colors.farmerColor }]}>Example: Rice Farmer in Razole</Text>
                <View style={styles.earningsRow}>
                  <View style={styles.earningsItem}>
                    <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>Old way (middleman)</Text>
                    <Text style={[styles.earningsValue, { color: colors.foreground }]}>₹22/kg</Text>
                    <Text style={[styles.earningsSub, { color: colors.mutedForeground }]}>paddy price</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.farmerColor} />
                  <View style={styles.earningsItem}>
                    <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>FarmLink (direct)</Text>
                    <Text style={[styles.earningsValue, { color: colors.farmerColor }]}>₹52/kg</Text>
                    <Text style={[styles.earningsSub, { color: colors.mutedForeground }]}>after milling (₹2/kg)</Text>
                  </View>
                </View>
                <Text style={[styles.earningsNote, { color: colors.farmerColor }]}>
                  That's ₹28 more per kg — on 500kg, you earn ₹14,000 more per harvest.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'mills' && (
            <View style={styles.section}>
              <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>
                These mills already exist in your area. You've been using them. The only change is: instead of selling processed produce to a middleman, list it on FarmLink.
              </Text>
              {LOCAL_MILLS.map((mill, i) => (
                <View key={i} style={[styles.millCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.millIcon, { backgroundColor: colors.farmerColor + '15' }]}>
                    <MaterialCommunityIcons name="factory" size={22} color={colors.farmerColor} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[styles.millName, { color: colors.foreground }]}>{mill.name}</Text>
                    <View style={styles.millMeta}>
                      <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.millMetaText, { color: colors.mutedForeground }]}>{mill.location}</Text>
                    </View>
                    <Text style={[styles.millProduces, { color: colors.mutedForeground }]}>
                      Processes: {mill.produces}
                    </Text>
                  </View>
                  <View style={[styles.feeBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.feeText, { color: colors.primary }]}>{mill.fee}</Text>
                  </View>
                </View>
              ))}
              <View style={[styles.infoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="information-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
                  Don't see your local mill? Add it in the app settings — help other farmers in your area find it.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'packaging' && (
            <View style={styles.section}>
              <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>
                No plastic. Packaging must be returned by the customer via the next delivery trip. This creates a circular system — you get your packaging back, customer gets a deposit refund, rider earns for the return trip.
              </Text>

              <View style={[styles.circularFlow, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '25' }]}>
                <Text style={[styles.circularTitle, { color: colors.primary }]}>How the circular loop works</Text>
                {[
                  ['Farmer packs rice in jute bag (₹25 deposit charged)', colors.farmerColor],
                  ['Rider delivers order + collects deposit money', colors.riderColor],
                  ['Consumer uses rice, keeps empty bag', colors.consumerColor],
                  ['Next delivery: rider picks up empty bag', colors.riderColor],
                  ['Consumer gets ₹25 back. Farmer reuses bag.', colors.primary],
                ].map(([text, color], i) => (
                  <View key={i} style={styles.flowStep}>
                    <View style={[styles.flowDot, { backgroundColor: color as string }]} />
                    <Text style={[styles.flowText, { color: colors.foreground }]}>{text}</Text>
                  </View>
                ))}
              </View>

              {PACKAGING_ORDER.map((key) => {
                const pkg = PACKAGING_INFO[key];
                return (
                  <View key={key} style={[styles.pkgCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.pkgIcon, { backgroundColor: pkg.color + '15' }]}>
                      <MaterialCommunityIcons name={pkg.icon as any} size={22} color={pkg.color} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[styles.pkgName, { color: colors.foreground }]}>{pkg.label}</Text>
                      <Text style={[styles.pkgMaterial, { color: colors.mutedForeground }]}>{pkg.material}</Text>
                      <Text style={[styles.pkgReturn, { color: pkg.color }]}>{pkg.returnNote}</Text>
                    </View>
                    {pkg.deposit > 0 ? (
                      <View style={[styles.depositBadge, { backgroundColor: pkg.color + '15' }]}>
                        <Text style={[styles.depositText, { color: pkg.color }]}>₹{pkg.deposit}</Text>
                        <Text style={[styles.depositLabel, { color: pkg.color }]}>deposit</Text>
                      </View>
                    ) : (
                      <View style={[styles.depositBadge, { backgroundColor: colors.freshGreenBg }]}>
                        <Text style={[styles.depositText, { color: colors.freshGreen }]}>Free</Text>
                        <Text style={[styles.depositLabel, { color: colors.freshGreen }]}>compost</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  body: { paddingHorizontal: 16, paddingBottom: 50, gap: 0 },
  section: { gap: 12 },
  sectionNote: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 4 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  infoDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, flex: 1 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepLine: { position: 'absolute', left: 21, top: 44, width: 2, height: 24 },
  stepContent: { flex: 1, paddingBottom: 16, paddingTop: 4 },
  stepTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  stepDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  earningsCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, marginTop: 4 },
  earningsTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  earningsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  earningsItem: { alignItems: 'center', gap: 2 },
  earningsLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  earningsValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  earningsSub: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  earningsNote: { fontSize: 12, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  millCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  millIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  millName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  millMeta: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  millMetaText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  millProduces: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  feeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  feeText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  circularFlow: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  circularTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  flowStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  flowDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  flowText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
  pkgCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  pkgIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pkgName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  pkgMaterial: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  pkgReturn: { fontSize: 11, fontFamily: 'Inter_500Medium', lineHeight: 16 },
  depositBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 56 },
  depositText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  depositLabel: { fontSize: 10, fontFamily: 'Inter_500Medium' },
});
