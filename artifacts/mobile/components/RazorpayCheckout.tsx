import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

import { useColors } from '@/hooks/useColors';

const RZP_BLUE = '#3395FF';
const RZP_DARK = '#072654';

const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'BOB', 'Canara', 'PNB'];

type PayTab = 'upi' | 'card' | 'netbanking';
type Stage = 'form' | 'processing' | 'success';

interface Props {
  visible: boolean;
  amount: number;
  produceName: string;
  onSuccess: (paymentId: string) => void;
  onDismiss: () => void;
}

export function RazorpayCheckout({ visible, amount, produceName, onSuccess, onDismiss }: Props) {
  const colors = useColors();
  const [tab, setTab] = useState<PayTab>('upi');
  const [stage, setStage] = useState<Stage>('form');

  // UPI
  const [upiId, setUpiId] = useState('');

  // Card
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // NetBanking
  const [bank, setBank] = useState('');

  const canPay =
    tab === 'upi'
      ? upiId.includes('@') && upiId.length > 3
      : tab === 'card'
      ? cardNo.replace(/\s/g, '').length >= 12 && expiry.length === 5 && cvv.length >= 3 && cardName.length > 1
      : bank.length > 0;

  const handlePay = async () => {
    if (!canPay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStage('processing');
    await new Promise((r) => setTimeout(r, 2000));
    setStage('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 800));
    const paymentId = `pay_${Date.now()}`;
    resetForm();
    onSuccess(paymentId);
  };

  const resetForm = () => {
    setStage('form');
    setTab('upi');
    setUpiId('');
    setCardNo('');
    setExpiry('');
    setCvv('');
    setCardName('');
    setBank('');
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.rzpBrand}>
              <View style={[styles.rzpIcon, { backgroundColor: RZP_DARK }]}>
                <Text style={styles.rzpIconText}>R</Text>
              </View>
              <View>
                <Text style={[styles.rzpName, { color: RZP_DARK }]}>Razorpay</Text>
                <Text style={[styles.rzpSecure, { color: colors.mutedForeground }]}>Secure Checkout</Text>
              </View>
            </View>
            <View style={styles.amountBlock}>
              <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Total</Text>
              <Text style={[styles.amountValue, { color: RZP_DARK }]}>₹{amount}</Text>
            </View>
          </View>

          {/* Order summary strip */}
          <View style={[styles.orderStrip, { backgroundColor: RZP_BLUE + '10' }]}>
            <MaterialCommunityIcons name="basket-outline" size={14} color={RZP_BLUE} />
            <Text style={[styles.orderStripText, { color: RZP_BLUE }]} numberOfLines={1}>
              {produceName}
            </Text>
            <View style={[styles.secureBadge, { backgroundColor: RZP_BLUE + '20' }]}>
              <MaterialCommunityIcons name="lock" size={10} color={RZP_BLUE} />
              <Text style={[styles.secureBadgeText, { color: RZP_BLUE }]}>256-bit SSL</Text>
            </View>
          </View>

          {stage === 'processing' ? (
            <View style={styles.processingView}>
              <ActivityIndicator size="large" color={RZP_BLUE} />
              <Text style={[styles.processingTitle, { color: colors.foreground }]}>Processing Payment</Text>
              <Text style={[styles.processingSubText, { color: colors.mutedForeground }]}>
                Please do not press back or close
              </Text>
            </View>
          ) : stage === 'success' ? (
            <View style={styles.processingView}>
              <View style={[styles.successCircle, { backgroundColor: '#16A34A15' }]}>
                <MaterialCommunityIcons name="check-circle" size={56} color="#16A34A" />
              </View>
              <Text style={[styles.processingTitle, { color: '#16A34A' }]}>Payment Successful!</Text>
              <Text style={[styles.processingSubText, { color: colors.mutedForeground }]}>
                Placing your order...
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
              {/* Payment method tabs */}
              <View style={[styles.tabs, { borderColor: colors.border }]}>
                {(['upi', 'card', 'netbanking'] as PayTab[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tabItem,
                      tab === t && [styles.tabItemActive, { borderBottomColor: RZP_BLUE }],
                    ]}
                    onPress={() => setTab(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, { color: tab === t ? RZP_BLUE : colors.mutedForeground }]}>
                      {t === 'upi' ? 'UPI' : t === 'card' ? 'Card' : 'NetBanking'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* UPI Tab */}
              {tab === 'upi' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Enter UPI ID</Text>
                  <View style={[styles.upiRow, { borderColor: upiId.includes('@') ? RZP_BLUE : colors.border, backgroundColor: colors.background }]}>
                    <TextInput
                      style={[styles.upiInput, { color: colors.foreground }]}
                      placeholder="yourname@upi"
                      placeholderTextColor={colors.mutedForeground}
                      value={upiId}
                      onChangeText={setUpiId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {upiId.includes('@') && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={RZP_BLUE} />
                    )}
                  </View>
                  <Text style={[styles.upiHint, { color: colors.mutedForeground }]}>
                    e.g. 9876543210@ybl, name@paytm, name@oksbi
                  </Text>

                  <View style={styles.upiApps}>
                    {['📱 GPay', '💸 PhonePe', '📲 Paytm', '🏦 BHIM'].map((app) => (
                      <TouchableOpacity
                        key={app}
                        style={[styles.upiAppChip, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => setUpiId(`demo@${app.split(' ')[1]?.toLowerCase() ?? 'upi'}`)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.upiAppText, { color: colors.foreground }]}>{app}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Card Tab */}
              {tab === 'card' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Card Number</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={colors.mutedForeground}
                    value={cardNo}
                    onChangeText={(v) => setCardNo(formatCard(v))}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                      <TextInput
                        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
                        placeholder="MM/YY"
                        placeholderTextColor={colors.mutedForeground}
                        value={expiry}
                        onChangeText={(v) => setExpiry(formatExpiry(v))}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
                      <TextInput
                        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
                        placeholder="•••"
                        placeholderTextColor={colors.mutedForeground}
                        value={cvv}
                        onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
                    placeholder="Name on card"
                    placeholderTextColor={colors.mutedForeground}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {/* NetBanking Tab */}
              {tab === 'netbanking' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Select Your Bank</Text>
                  <View style={styles.bankGrid}>
                    {BANKS.map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[
                          styles.bankChip,
                          {
                            backgroundColor: bank === b ? RZP_BLUE + '12' : colors.background,
                            borderColor: bank === b ? RZP_BLUE : colors.border,
                            borderWidth: bank === b ? 2 : 1,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setBank(b);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.bankIcon, { color: bank === b ? RZP_BLUE : colors.foreground }]}>
                          🏦
                        </Text>
                        <Text style={[styles.bankLabel, { color: bank === b ? RZP_BLUE : colors.foreground }]}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Pay button */}
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: canPay ? RZP_BLUE : colors.muted }]}
                onPress={handlePay}
                disabled={!canPay}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="lock" size={16} color={canPay ? '#fff' : colors.mutedForeground} />
                <Text style={[styles.payBtnText, { color: canPay ? '#fff' : colors.mutedForeground }]}>
                  Pay ₹{amount} Securely
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDismiss} style={styles.cancelBtn} activeOpacity={0.7}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>

              {/* Razorpay trust footer */}
              <View style={styles.trustRow}>
                <MaterialCommunityIcons name="shield-check-outline" size={12} color={colors.mutedForeground} />
                <Text style={[styles.trustText, { color: colors.mutedForeground }]}>
                  Secured by Razorpay · PCI DSS Compliant · RBI regulated
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rzpBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rzpIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rzpIconText: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  rzpName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  rzpSecure: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  amountBlock: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  amountValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  orderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderStripText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  secureBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  body: { paddingHorizontal: 20 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: {},
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  tabContent: { paddingTop: 16, paddingBottom: 8, gap: 10 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  upiInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  upiHint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  upiApps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  upiAppChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  upiAppText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: '44%',
  },
  bankIcon: { fontSize: 16 },
  bankLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  payBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', paddingVertical: 12 },
  trustText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  processingView: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  processingTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  processingSubText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
