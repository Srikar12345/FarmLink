import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CropRequestCard } from '@/components/CropRequestCard';
import { useApp, type ProduceCategory, type RequestFrequency, type RequesterType } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const CATEGORIES: { key: ProduceCategory; label: string }[] = [
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'fruits', label: 'Fruits' },
  { key: 'grains', label: 'Grains' },
  { key: 'herbs', label: 'Herbs' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'other', label: 'Other' },
];

const FREQ_OPTIONS: { key: RequestFrequency; label: string; desc: string }[] = [
  { key: 'once', label: 'One-time', desc: 'Single purchase' },
  { key: 'weekly', label: 'Weekly', desc: 'Every week' },
  { key: 'monthly', label: 'Monthly', desc: 'Every month' },
  { key: 'seasonal', label: 'Seasonal', desc: 'During season' },
];

const REQUESTER_OPTIONS: { key: RequesterType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'restaurant', label: 'Restaurant', icon: 'silverware-fork-knife' },
  { key: 'business', label: 'Business', icon: 'office-building-outline' },
];

const UNITS = ['kg', 'grams', 'dozen', 'bunch', 'litre', 'piece'];

export default function RequestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getOpenRequests, getMyRequests, addCropRequest, currentUser } = useApp();

  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [produceName, setProduceName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [maxPrice, setMaxPrice] = useState('');
  const [frequency, setFrequency] = useState<RequestFrequency>('once');
  const [requesterType, setRequesterType] = useState<RequesterType>('home');
  const [description, setDescription] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const displayed = tab === 'all' ? getOpenRequests() : getMyRequests();

  const handleSubmit = () => {
    if (!produceName.trim() || !quantity || !maxPrice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCropRequest({
      produceName: produceName.trim(),
      category,
      quantityNeeded: parseFloat(quantity),
      quantityUnit: unit,
      maxPricePerUnit: parseFloat(maxPrice),
      priceUnit: unit === 'grams' ? 'kg' : unit,
      frequency,
      requesterType,
      description: description.trim() || `Looking for ${produceName.trim()} — ${FREQ_OPTIONS.find(f => f.key === frequency)?.label} supply.`,
    });
    setShowModal(false);
    setProduceName('');
    setQuantity('');
    setMaxPrice('');
    setDescription('');
    setTab('mine');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Crop Requests</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Tell farmers what you need — before it's even planted
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.postBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {(['all', 'mine'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, { color: tab === t ? colors.foreground : colors.mutedForeground }]}>
                {t === 'all' ? 'All Requests' : 'My Requests'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!displayed.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="seed-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {tab === 'mine' ? 'No requests posted yet' : 'No open requests'}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {tab === 'mine'
                ? 'Post what produce you want — farmers near you will see it and commit to grow it'
                : 'Be the first to request a crop'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>
                Post a Request
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <CropRequestCard request={item} />}
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={[styles.modal, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalHeader, { borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Request a Crop</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Farmers will see this and commit to grow it for you — like how Michelin restaurants privately source from farmers, but for everyone.
            </Text>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>What do you need? *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="e.g. Finger Lime, Heirloom Tomatoes, Moringa..."
                placeholderTextColor={colors.mutedForeground}
                value={produceName}
                onChangeText={setProduceName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[
                      styles.chip,
                      { backgroundColor: category === c.key ? colors.primary : colors.card, borderColor: category === c.key ? colors.primary : colors.border },
                    ]}
                    onPress={() => setCategory(c.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, { color: category === c.key ? '#fff' : colors.mutedForeground }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>I am a</Text>
              <View style={styles.chipRow}>
                {REQUESTER_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[
                      styles.chip,
                      { backgroundColor: requesterType === r.key ? colors.consumerColor : colors.card, borderColor: requesterType === r.key ? colors.consumerColor : colors.border },
                    ]}
                    onPress={() => setRequesterType(r.key)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name={r.icon} size={13} color={requesterType === r.key ? '#fff' : colors.mutedForeground} />
                    <Text style={[styles.chipText, { color: requesterType === r.key ? '#fff' : colors.mutedForeground }]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formField, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Quantity *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formField, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.chip, { backgroundColor: unit === u ? colors.primary : colors.card, borderColor: unit === u ? colors.primary : colors.border }]}
                        onPress={() => setUnit(u)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, { color: unit === u ? '#fff' : colors.mutedForeground }]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Max price you'll pay (₹ per {unit}) *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="e.g. 150"
                placeholderTextColor={colors.mutedForeground}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>How often?</Text>
              <View style={styles.freqGrid}>
                {FREQ_OPTIONS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.freqCard,
                      { backgroundColor: frequency === f.key ? colors.primary + '12' : colors.card, borderColor: frequency === f.key ? colors.primary : colors.border, borderWidth: frequency === f.key ? 2 : 1 },
                    ]}
                    onPress={() => setFrequency(f.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.freqLabel, { color: frequency === f.key ? colors.primary : colors.foreground }]}>
                      {f.label}
                    </Text>
                    <Text style={[styles.freqDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Details (optional)</Text>
              <TextInput
                style={[styles.textarea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="Describe what you need — variety, quality, usage, how you'll use it..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: produceName && quantity && maxPrice ? colors.primary : colors.muted }]}
              onPress={handleSubmit}
              disabled={!produceName || !quantity || !maxPrice}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="seed" size={18} color={produceName && quantity && maxPrice ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.submitText, { color: produceName && quantity && maxPrice ? '#fff' : colors.mutedForeground }]}>
                Post Request
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, maxWidth: 260 },
  postBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 0,
  },
  tabLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },
  emptyBtn: { marginTop: 8, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 18 },
  modalSub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  formField: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 90,
  },
  row: { flexDirection: 'row', gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  freqGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  freqCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '45%',
  },
  freqLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  freqDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
