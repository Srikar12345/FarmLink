import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProcessingGuideModal } from '@/components/ProcessingGuideModal';
import { PACKAGING_INFO, PROCESSING_INFO, useApp, type PackagingType, type ProduceCategory, type ProcessingStatus } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const CATEGORIES: { key: ProduceCategory; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  { key: 'grains', label: 'Rice & Grains', icon: 'grain', color: '#B45309' },
  { key: 'seafood', label: 'Seafood & Fish', icon: 'fish', color: '#0891B2' },
  { key: 'meat', label: 'Meat & Poultry', icon: 'food-drumstick-outline', color: '#DC2626' },
  { key: 'vegetables', label: 'Vegetables', icon: 'carrot', color: '#16A34A' },
  { key: 'fruits', label: 'Fruits', icon: 'fruit-grapes', color: '#EA580C' },
  { key: 'dairy', label: 'Dairy', icon: 'cow', color: '#2563EB' },
  { key: 'herbs', label: 'Herbs & Spices', icon: 'leaf', color: '#7C3AED' },
  { key: 'other', label: 'Other', icon: 'basket', color: '#6B7280' },
];

const PRICE_UNITS = ['kg', 'dozen', 'bunch', 'piece', 'litre', 'box'];

const HARVEST_OPTIONS = [
  { label: 'Just now', hours: 0 },
  { label: '1 hour ago', hours: 1 },
  { label: '2 hours ago', hours: 2 },
  { label: '4 hours ago', hours: 4 },
  { label: '6 hours ago', hours: 6 },
  { label: 'This morning', hours: 8 },
  { label: 'Yesterday', hours: 24 },
];

const PROCESSING_OPTIONS: ProcessingStatus[] = ['raw_harvest', 'mill_processed', 'value_added'];
const PACKAGING_OPTIONS: PackagingType[] = ['jute_bag', 'cloth_bag', 'glass_jar', 'leaf_basket', 'steel_tin', 'paper_bag'];

export default function AddListing() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addListing } = useApp();

  const [produceName, setProduceName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('grains');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [harvestHoursAgo, setHarvestHoursAgo] = useState(2);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('mill_processed');
  const [processingNote, setProcessingNote] = useState('');
  const [packagingType, setPackagingType] = useState<PackagingType>('jute_bag');
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const selectedPkg = PACKAGING_INFO[packagingType];
  const canSell = processingStatus !== 'raw_harvest' ||
    ['fruits', 'vegetables', 'herbs', 'other'].includes(category);

  const handleSubmit = async () => {
    if (!produceName.trim() || !price || !quantity) {
      Alert.alert('Missing Info', 'Please fill in produce name, price and quantity.');
      return;
    }
    if (!canSell) {
      Alert.alert(
        'Process Before Listing',
        'Raw paddy/grains cannot be sold directly. Please take your produce to a local mill first, then list it as "Mill Processed". Check the Guide tab for nearby mills.',
        [{ text: 'See Guide', onPress: () => setShowGuide(true) }, { text: 'OK' }],
      );
      return;
    }
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const harvestTime = new Date(Date.now() - harvestHoursAgo * 60 * 60 * 1000).toISOString();
    addListing({
      produceName: produceName.trim(),
      category,
      price: parseFloat(price),
      priceUnit,
      quantity: parseFloat(quantity),
      quantityUnit: priceUnit === 'kg' ? 'kg' : priceUnit === 'litre' ? 'litres' : priceUnit + 's',
      description: description.trim() || `Fresh ${produceName.trim()} from East Godavari, directly from the farm.`,
      harvestTime,
      processingStatus,
      processingNote: processingNote.trim() || undefined,
      packagingType,
      packagingDeposit: selectedPkg.deposit,
    });
    Alert.alert(
      'Listing Posted!',
      `Your ${produceName} is now visible to consumers nearby.\n\nPackaging: ${selectedPkg.label}${selectedPkg.deposit > 0 ? ` (₹${selectedPkg.deposit} deposit per unit — returned on next trip)` : ' — compostable, no return needed'}`,
      [{ text: 'Done', onPress: () => router.replace('/(farmer)' as any) }],
    );
    setSubmitting(false);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>Add Produce</Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                List what you've grown and processed
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.guideBtn, { backgroundColor: colors.farmerColor + '15', borderColor: colors.farmerColor + '40' }]}
              onPress={() => setShowGuide(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="help-circle-outline" size={16} color={colors.farmerColor} />
              <Text style={[styles.guideBtnText, { color: colors.farmerColor }]}>Guide</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Produce Name *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="e.g. Sona Masuri Rice, Tender Coconut, Tiger Prawns"
                placeholderTextColor={colors.mutedForeground}
                value={produceName}
                onChangeText={setProduceName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Category *</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((c) => {
                  const isSelected = category === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: isSelected ? c.color + '18' : colors.card,
                          borderColor: isSelected ? c.color : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setCategory(c.key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name={c.icon} size={16} color={isSelected ? c.color : colors.mutedForeground} />
                      <Text style={[styles.catLabel, { color: isSelected ? c.color : colors.mutedForeground }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Processing Status *</Text>
              <Text style={[styles.labelHint, { color: colors.mutedForeground }]}>
                Rice/grains must be mill-processed before listing. Fruits, vegetables and fish can be listed raw.
              </Text>
              <View style={styles.procGrid}>
                {PROCESSING_OPTIONS.map((key) => {
                  const info = PROCESSING_INFO[key];
                  const isSelected = processingStatus === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.procCard,
                        {
                          backgroundColor: isSelected ? info.color + '12' : colors.card,
                          borderColor: isSelected ? info.color : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setProcessingStatus(key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name={info.icon as any} size={18} color={isSelected ? info.color : colors.mutedForeground} />
                      <Text style={[styles.procLabel, { color: isSelected ? info.color : colors.foreground }]}>
                        {info.label}
                      </Text>
                      <Text style={[styles.procDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {info.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {!canSell && (
              <View style={[styles.warningCard, { backgroundColor: '#DC2626' + '12', borderColor: '#DC2626' + '30' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warningTitle, { color: '#DC2626' }]}>Cannot list raw grains directly</Text>
                  <Text style={[styles.warningDesc, { color: colors.mutedForeground }]}>
                    Take your paddy to a local rice mill first. Change status to "Mill Processed" after milling.{' '}
                    <Text style={{ color: colors.farmerColor, fontFamily: 'Inter_600SemiBold' }} onPress={() => setShowGuide(true)}>
                      See nearby mills →
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Processing / Mill Details (optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="e.g. Milled at Rajam Rice Mill, Kakinada Road"
                placeholderTextColor={colors.mutedForeground}
                value={processingNote}
                onChangeText={setProcessingNote}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Price (₹) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unitRow}>
                    {PRICE_UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.unitChip,
                          {
                            backgroundColor: priceUnit === u ? colors.primary : colors.card,
                            borderColor: priceUnit === u ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setPriceUnit(u)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitLabel, { color: priceUnit === u ? '#fff' : colors.mutedForeground }]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Quantity Available *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder={`How many ${priceUnit}s do you have?`}
                placeholderTextColor={colors.mutedForeground}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>When was it harvested / milled?</Text>
              <View style={styles.harvestGrid}>
                {HARVEST_OPTIONS.map((h) => (
                  <TouchableOpacity
                    key={h.hours}
                    style={[
                      styles.harvestChip,
                      {
                        backgroundColor: harvestHoursAgo === h.hours ? colors.freshGreenBg : colors.card,
                        borderColor: harvestHoursAgo === h.hours ? colors.freshGreen : colors.border,
                        borderWidth: harvestHoursAgo === h.hours ? 2 : 1,
                      },
                    ]}
                    onPress={() => setHarvestHoursAgo(h.hours)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.harvestLabel, { color: harvestHoursAgo === h.hours ? colors.freshGreen : colors.mutedForeground }]}>
                      {h.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Eco Packaging Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Eco Packaging *</Text>
              <Text style={[styles.labelHint, { color: colors.mutedForeground }]}>
                No plastic allowed. Choose packaging — deposit is refunded when customer returns it.
              </Text>
              <View style={styles.pkgGrid}>
                {PACKAGING_OPTIONS.map((key) => {
                  const pkg = PACKAGING_INFO[key];
                  const isSelected = packagingType === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.pkgCard,
                        {
                          backgroundColor: isSelected ? pkg.color + '12' : colors.card,
                          borderColor: isSelected ? pkg.color : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setPackagingType(key)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name={pkg.icon as any} size={20} color={isSelected ? pkg.color : colors.mutedForeground} />
                      <Text style={[styles.pkgName, { color: isSelected ? pkg.color : colors.foreground }]}>
                        {pkg.label}
                      </Text>
                      <Text style={[styles.pkgDeposit, { color: colors.mutedForeground }]}>
                        {pkg.deposit > 0 ? `₹${pkg.deposit} deposit` : 'Compostable'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedPkg && (
                <View style={[styles.pkgNote, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="arrow-u-left-top" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.pkgNoteText, { color: colors.mutedForeground }]}>{selectedPkg.returnNote}</Text>
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Description</Text>
              <TextInput
                style={[styles.textarea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                placeholder="Tell buyers about your produce — variety, where it's grown, how it was processed..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.previewCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="eye-outline" size={16} color={colors.primary} />
              <Text style={[styles.previewText, { color: colors.primary }]}>
                ₹{price || '0'}/{priceUnit} · {quantity || '0'} {priceUnit}s · {PACKAGING_INFO[packagingType].label}
                {selectedPkg.deposit > 0 ? ` + ₹${selectedPkg.deposit} deposit` : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: produceName && price && quantity ? colors.primary : colors.muted },
            ]}
            onPress={handleSubmit}
            disabled={!produceName || !price || !quantity || submitting}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="upload"
              size={18}
              color={produceName && price && quantity ? '#fff' : colors.mutedForeground}
            />
            <Text style={[styles.submitText, { color: produceName && price && quantity ? '#fff' : colors.mutedForeground }]}>
              {submitting ? 'Posting...' : 'Post Listing'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProcessingGuideModal visible={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  guideBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  form: { gap: 20, marginBottom: 24 },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  labelHint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: -4, lineHeight: 16 },
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
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 100,
  },
  row: { flexDirection: 'row', gap: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  catLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  unitRow: { flexDirection: 'row', gap: 8 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  unitLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  harvestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  harvestChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  harvestLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  procGrid: { gap: 8 },
  procCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, flexWrap: 'wrap' },
  procLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 },
  procDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', width: '100%' },
  warningCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  warningTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  warningDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  pkgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pkgCard: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '30%',
  },
  pkgName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  pkgDeposit: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  pkgNote: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  pkgNoteText: { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 16 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewText: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
