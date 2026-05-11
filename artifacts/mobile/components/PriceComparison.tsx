import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface MarketPrice {
  platform: string;
  color: string;
  price: number;
}

// Realistic Indian retail prices (approx. mid-2025) from popular delivery apps
const MARKET_DATA: Record<string, MarketPrice[]> = {
  sona_masuri: [
    { platform: 'Blinkit', color: '#FFCB00', price: 82 },
    { platform: 'Zepto', color: '#8B2CF5', price: 79 },
    { platform: 'BigBasket', color: '#84C225', price: 76 },
    { platform: 'JioMart', color: '#004B8D', price: 72 },
    { platform: 'Amazon', color: '#FF9900', price: 88 },
    { platform: 'Flipkart', color: '#2874F0', price: 85 },
  ],
  bpt_rice: [
    { platform: 'Blinkit', color: '#FFCB00', price: 72 },
    { platform: 'Zepto', color: '#8B2CF5', price: 68 },
    { platform: 'BigBasket', color: '#84C225', price: 65 },
    { platform: 'JioMart', color: '#004B8D', price: 62 },
    { platform: 'Amazon', color: '#FF9900', price: 78 },
    { platform: 'Flipkart', color: '#2874F0', price: 75 },
  ],
  tomato: [
    { platform: 'Blinkit', color: '#FFCB00', price: 58 },
    { platform: 'Zepto', color: '#8B2CF5', price: 55 },
    { platform: 'Swiggy', color: '#FF5200', price: 62 },
    { platform: 'BigBasket', color: '#84C225', price: 52 },
    { platform: 'JioMart', color: '#004B8D', price: 48 },
    { platform: 'Amazon', color: '#FF9900', price: 65 },
  ],
  grape: [
    { platform: 'Blinkit', color: '#FFCB00', price: 195 },
    { platform: 'Zepto', color: '#8B2CF5', price: 185 },
    { platform: 'Swiggy', color: '#FF5200', price: 210 },
    { platform: 'BigBasket', color: '#84C225', price: 175 },
    { platform: 'JioMart', color: '#004B8D', price: 170 },
    { platform: 'Amazon', color: '#FF9900', price: 220 },
  ],
  coconut: [
    { platform: 'Blinkit', color: '#FFCB00', price: 55 },
    { platform: 'Zepto', color: '#8B2CF5', price: 50 },
    { platform: 'BigBasket', color: '#84C225', price: 45 },
    { platform: 'JioMart', color: '#004B8D', price: 42 },
    { platform: 'Amazon', color: '#FF9900', price: 60 },
  ],
  turmeric: [
    { platform: 'Blinkit', color: '#FFCB00', price: 110 },
    { platform: 'Zepto', color: '#8B2CF5', price: 105 },
    { platform: 'BigBasket', color: '#84C225', price: 95 },
    { platform: 'JioMart', color: '#004B8D', price: 90 },
    { platform: 'Amazon', color: '#FF9900', price: 125 },
  ],
  prawn: [
    { platform: 'Blinkit', color: '#FFCB00', price: 580 },
    { platform: 'BigBasket', color: '#84C225', price: 550 },
    { platform: 'JioMart', color: '#004B8D', price: 520 },
    { platform: 'Amazon', color: '#FF9900', price: 620 },
  ],
  banana: [
    { platform: 'Blinkit', color: '#FFCB00', price: 68 },
    { platform: 'Zepto', color: '#8B2CF5', price: 62 },
    { platform: 'BigBasket', color: '#84C225', price: 58 },
    { platform: 'JioMart', color: '#004B8D', price: 55 },
    { platform: 'Swiggy', color: '#FF5200', price: 72 },
  ],
  spinach: [
    { platform: 'Blinkit', color: '#FFCB00', price: 85 },
    { platform: 'Zepto', color: '#8B2CF5', price: 80 },
    { platform: 'BigBasket', color: '#84C225', price: 75 },
    { platform: 'JioMart', color: '#004B8D', price: 70 },
  ],
  mango: [
    { platform: 'Blinkit', color: '#FFCB00', price: 749 },
    { platform: 'Zepto', color: '#8B2CF5', price: 720 },
    { platform: 'BigBasket', color: '#84C225', price: 680 },
    { platform: 'Amazon', color: '#FF9900', price: 850 },
    { platform: 'JioMart', color: '#004B8D', price: 699 },
  ],
  rice: [
    { platform: 'Blinkit', color: '#FFCB00', price: 135 },
    { platform: 'Zepto', color: '#8B2CF5', price: 125 },
    { platform: 'BigBasket', color: '#84C225', price: 120 },
    { platform: 'JioMart', color: '#004B8D', price: 115 },
    { platform: 'Amazon', color: '#FF9900', price: 140 },
    { platform: 'Flipkart', color: '#2874F0', price: 148 },
  ],
  dal: [
    { platform: 'Blinkit', color: '#FFCB00', price: 180 },
    { platform: 'Zepto', color: '#8B2CF5', price: 175 },
    { platform: 'BigBasket', color: '#84C225', price: 165 },
    { platform: 'JioMart', color: '#004B8D', price: 160 },
    { platform: 'Amazon', color: '#FF9900', price: 195 },
    { platform: 'Flipkart', color: '#2874F0', price: 200 },
  ],
  coriander: [
    { platform: 'Blinkit', color: '#FFCB00', price: 35 },
    { platform: 'Zepto', color: '#8B2CF5', price: 30 },
    { platform: 'BigBasket', color: '#84C225', price: 28 },
    { platform: 'JioMart', color: '#004B8D', price: 25 },
  ],
};

const ESTIMATE_MULTIPLIERS: Omit<MarketPrice, 'price'>[] = [
  { platform: 'Blinkit', color: '#FFCB00' },
  { platform: 'Zepto', color: '#8B2CF5' },
  { platform: 'BigBasket', color: '#84C225' },
  { platform: 'JioMart', color: '#004B8D' },
  { platform: 'Amazon', color: '#FF9900' },
];

function getMarketPrices(produceName: string, farmLinkPrice: number): MarketPrice[] {
  const lower = produceName.toLowerCase();
  if (lower.includes('sona masuri') || lower.includes('sonamasuri')) return MARKET_DATA.sona_masuri;
  if (lower.includes('bpt') || lower.includes('5204') || lower.includes('samba')) return MARKET_DATA.bpt_rice;
  if (lower.includes('tomato')) return MARKET_DATA.tomato;
  if (lower.includes('grape')) return MARKET_DATA.grape;
  if (lower.includes('coconut') || lower.includes('tender')) return MARKET_DATA.coconut;
  if (lower.includes('turmeric') || lower.includes('haldi')) return MARKET_DATA.turmeric;
  if (lower.includes('prawn') || lower.includes('shrimp') || lower.includes('jhinga')) return MARKET_DATA.prawn;
  if (lower.includes('banana') || lower.includes('balekai') || lower.includes('monthan')) return MARKET_DATA.banana;
  if (lower.includes('spinach') || lower.includes('palak')) return MARKET_DATA.spinach;
  if (lower.includes('mango') || lower.includes('alphonso') || lower.includes('hapus')) return MARKET_DATA.mango;
  if (lower.includes('rice') || lower.includes('basmati')) return MARKET_DATA.rice;
  if (lower.includes('dal') || lower.includes('daal') || lower.includes('urad') || lower.includes('chana')) return MARKET_DATA.dal;
  if (lower.includes('coriander') || lower.includes('dhania')) return MARKET_DATA.coriander;
  // Estimate based on FarmLink price — retail typically 1.4–1.8× farm gate
  return ESTIMATE_MULTIPLIERS.map((m, i) => ({
    ...m,
    price: Math.round(farmLinkPrice * (1.4 + i * 0.09)),
  }));
}

interface PriceComparisonProps {
  produceName: string;
  farmLinkPrice: number;
  priceUnit: string;
  category?: string;
}

export function PriceComparison({ produceName, farmLinkPrice, priceUnit, category }: PriceComparisonProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const marketPrices = getMarketPrices(produceName, farmLinkPrice);
  const isLocalOnly = category === 'seafood' || category === 'meat' ||
    produceName.toLowerCase().includes('prawn') ||
    produceName.toLowerCase().includes('fish') ||
    produceName.toLowerCase().includes('chicken');
  const avgMarket = Math.round(marketPrices.reduce((s, p) => s + p.price, 0) / marketPrices.length);
  const savings = avgMarket - farmLinkPrice;
  const savingsPct = Math.round((savings / avgMarket) * 100);
  const maxBar = Math.max(...marketPrices.map((p) => p.price));
  const displayed = expanded ? marketPrices : marketPrices.slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="tag-multiple" size={16} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>Price Comparison</Text>
        </View>
        <View style={[styles.savingsBadge, { backgroundColor: colors.freshGreenBg }]}>
          <Text style={[styles.savingsText, { color: colors.freshGreen }]}>Save {savingsPct}%</Text>
        </View>
      </View>

      {isLocalOnly ? (
        <View style={[styles.caveatBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#EA580C" />
          <Text style={[styles.caveatText, { color: '#9A3412' }]}>
            Fresh {category === 'seafood' ? 'catch' : 'local produce'} like this isn't sold on these apps — they carry
            frozen or imported variants from other regions. Prices below are for reference only.
          </Text>
        </View>
      ) : (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          vs. popular delivery apps (per {priceUnit}, incl. middleman margin)
        </Text>
      )}

      <View style={styles.farmLinkRow}>
        <View style={[styles.platformDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.farmLinkLabel, { color: colors.foreground }]}>FarmLink</Text>
        <Text style={[styles.farmLinkPrice, { color: colors.primary }]}>₹{farmLinkPrice}</Text>
        <View style={[styles.directBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.directText, { color: colors.primary }]}>Farm gate price</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {displayed.map((item) => {
        const diff = item.price - farmLinkPrice;
        const pct = Math.round((diff / item.price) * 100);
        const barWidth = Math.min(95, (item.price / (maxBar * 1.05)) * 100);
        return (
          <View key={item.platform} style={styles.platformRow}>
            <View style={[styles.platformDot, { backgroundColor: item.color }]} />
            <Text style={[styles.platformName, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.platform}
            </Text>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${barWidth}%` as any, backgroundColor: item.color + '35' }]} />
            </View>
            <Text style={[styles.platformPrice, { color: colors.foreground }]}>₹{item.price}</Text>
            <Text style={[styles.saving, { color: colors.freshGreen }]}>-{pct}%</Text>
          </View>
        );
      })}

      {marketPrices.length > 4 && (
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.expandText, { color: colors.primary }]}>
            {expanded ? 'Show less' : `+${marketPrices.length - 4} more platforms`}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}

      <View style={[styles.summaryRow, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40' }]}>
        <MaterialCommunityIcons name="leaf" size={14} color={colors.freshGreen} />
        <Text style={[styles.summaryText, { color: colors.freshGreen }]}>
          Average ₹{savings}/{priceUnit} cheaper than retail apps. No middleman — you pay the farmer directly.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  savingsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  savingsText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -4 },
  farmLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  platformDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  farmLinkLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', width: 72, flexShrink: 0 },
  farmLinkPrice: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  directBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 4 },
  directText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1 },
  platformRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 28 },
  platformName: { fontSize: 13, fontFamily: 'Inter_500Medium', width: 72, flexShrink: 0 },
  barContainer: { flex: 1, height: 20, borderRadius: 4, overflow: 'hidden', justifyContent: 'center' },
  bar: { height: '100%', borderRadius: 4 },
  platformPrice: { fontSize: 13, fontFamily: 'Inter_600SemiBold', width: 44, textAlign: 'right', flexShrink: 0 },
  saving: { fontSize: 11, fontFamily: 'Inter_600SemiBold', width: 32, textAlign: 'right', flexShrink: 0 },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', paddingVertical: 2 },
  expandText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 18 },
  caveatBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  caveatText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
});
