import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  cashAmount: number;
  creditAmount: number; // cash + 15% bonus
  onCash: () => void;
  onCredit: () => void;
  onDismiss: () => void;
}

export function PaymentChoiceModal({ visible, cashAmount, creditAmount, onCash, onCredit, onDismiss }: Props) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={[styles.successIcon, { backgroundColor: colors.freshGreenBg }]}>
            <MaterialCommunityIcons name="check-circle" size={40} color={colors.freshGreen} />
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>Delivery Complete!</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Choose how you'd like to receive your earnings
          </Text>

          {/* Cash / UPI option */}
          <TouchableOpacity
            style={[styles.option, styles.optionPrimary, { backgroundColor: colors.riderColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onCash();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="cash-multiple" size={28} color="#fff" />
              <View>
                <Text style={styles.optionTitle}>Receive Cash / UPI</Text>
                <Text style={styles.optionSub}>Collect from customer now</Text>
              </View>
            </View>
            <Text style={styles.optionAmount}>₹{cashAmount}</Text>
          </TouchableOpacity>

          {/* Credits option */}
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.freshGreenBg, borderColor: colors.freshGreen + '40', borderWidth: 1.5 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onCredit();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={28} color={colors.freshGreen} />
              <View>
                <Text style={[styles.optionTitle, { color: colors.freshGreen }]}>FarmLink Credits</Text>
                <Text style={[styles.optionSub, { color: colors.freshGreen + 'AA' }]}>
                  Use to buy groceries on FarmLink
                </Text>
              </View>
            </View>
            <View style={styles.creditRight}>
              <Text style={[styles.optionAmount, { color: colors.freshGreen }]}>₹{creditAmount}</Text>
              <View style={[styles.bonusBadge, { backgroundColor: colors.freshGreen }]}>
                <Text style={styles.bonusText}>+15%</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Credits work like money inside FarmLink — scan QR to pay farmers directly, or use at checkout
          </Text>

          <TouchableOpacity onPress={onDismiss} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Decide later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    elevation: 16,
  },
  handle: { width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  successIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  option: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
  },
  optionPrimary: {},
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
  optionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  optionAmount: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
  creditRight: { alignItems: 'flex-end', gap: 4 },
  bonusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bonusText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#fff' },
  note: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 17 },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
