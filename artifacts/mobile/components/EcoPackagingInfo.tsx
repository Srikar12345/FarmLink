import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PACKAGING_INFO, PROCESSING_INFO, type PackagingType, type ProcessingStatus } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

interface EcoPackagingInfoProps {
  packagingType?: PackagingType;
  packagingDeposit?: number;
  processingStatus?: ProcessingStatus;
  processingNote?: string;
  orderId?: string;
  orderStatus?: string;
  packagingReturnRequested?: boolean;
  onRequestReturn?: (orderId: string) => void;
}

export function EcoPackagingInfo({
  packagingType,
  packagingDeposit,
  processingStatus,
  processingNote,
  orderId,
  orderStatus,
  packagingReturnRequested,
  onRequestReturn,
}: EcoPackagingInfoProps) {
  const colors = useColors();
  const [returned, setReturned] = useState(false);

  const pkgInfo = packagingType ? PACKAGING_INFO[packagingType] : null;
  const procInfo = processingStatus ? PROCESSING_INFO[processingStatus] : null;

  if (!pkgInfo && !procInfo) return null;

  const canRequestReturn = orderId && orderStatus === 'delivered' && pkgInfo && pkgInfo.deposit > 0 && !packagingReturnRequested && !returned;

  const handleReturn = () => {
    if (!orderId) return;
    Alert.alert(
      'Schedule Packaging Return',
      `Keep your empty ${pkgInfo?.label} ready. The next FarmLink rider coming to your area will collect it and you'll receive ₹${pkgInfo?.deposit} back.\n\nThis packaging goes back to the farmer — zero waste, no cost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule Return',
          onPress: () => {
            onRequestReturn?.(orderId);
            setReturned(true);
            Alert.alert(
              'Return Scheduled!',
              `Your ₹${pkgInfo?.deposit} deposit refund is on the way once the rider collects the empty ${pkgInfo?.label}.`,
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="recycle" size={16} color={colors.freshGreen} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Eco Packaging & Processing</Text>
        <View style={[styles.zeroBadge, { backgroundColor: colors.freshGreenBg }]}>
          <Text style={[styles.zeroBadgeText, { color: colors.freshGreen }]}>Zero plastic</Text>
        </View>
      </View>

      {procInfo && (
        <View style={[styles.procRow, { backgroundColor: procInfo.color + '10', borderColor: procInfo.color + '30' }]}>
          <MaterialCommunityIcons name={procInfo.icon as any} size={16} color={procInfo.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.procLabel, { color: procInfo.color }]}>{procInfo.label}</Text>
            {processingNote && (
              <Text style={[styles.procNote, { color: colors.mutedForeground }]}>{processingNote}</Text>
            )}
          </View>
        </View>
      )}

      {pkgInfo && (
        <View style={styles.pkgBlock}>
          <View style={styles.pkgTopRow}>
            <View style={[styles.pkgIconBox, { backgroundColor: pkgInfo.color + '15' }]}>
              <MaterialCommunityIcons name={pkgInfo.icon as any} size={20} color={pkgInfo.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.pkgName, { color: colors.foreground }]}>{pkgInfo.label}</Text>
              <Text style={[styles.pkgMaterial, { color: colors.mutedForeground }]}>{pkgInfo.material}</Text>
            </View>
            {pkgInfo.deposit > 0 ? (
              <View style={[styles.depositBox, { backgroundColor: pkgInfo.color + '15' }]}>
                <Text style={[styles.depositNum, { color: pkgInfo.color }]}>₹{pkgInfo.deposit}</Text>
                <Text style={[styles.depositWord, { color: pkgInfo.color }]}>deposit</Text>
              </View>
            ) : (
              <View style={[styles.depositBox, { backgroundColor: colors.freshGreenBg }]}>
                <MaterialCommunityIcons name="leaf" size={14} color={colors.freshGreen} />
                <Text style={[styles.depositWord, { color: colors.freshGreen }]}>compost</Text>
              </View>
            )}
          </View>

          <View style={styles.returnRow}>
            <MaterialCommunityIcons name="arrow-u-left-top" size={13} color={colors.mutedForeground} />
            <Text style={[styles.returnNote, { color: colors.mutedForeground }]}>{pkgInfo.returnNote}</Text>
          </View>
        </View>
      )}

      {canRequestReturn && (
        <TouchableOpacity
          style={[styles.returnBtn, { backgroundColor: colors.freshGreen }]}
          onPress={handleReturn}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="recycle" size={16} color="#fff" />
          <Text style={styles.returnBtnText}>Return packaging — get ₹{pkgInfo?.deposit} back</Text>
        </TouchableOpacity>
      )}

      {(packagingReturnRequested || returned) && pkgInfo && pkgInfo.deposit > 0 && (
        <View style={[styles.scheduledRow, { backgroundColor: colors.freshGreenBg }]}>
          <MaterialCommunityIcons name="check-circle" size={15} color={colors.freshGreen} />
          <Text style={[styles.scheduledText, { color: colors.freshGreen }]}>
            Return scheduled — rider will collect your {pkgInfo.label} on next visit. ₹{pkgInfo.deposit} refund pending.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  zeroBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  zeroBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  procRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  procLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  procNote: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, marginTop: 2 },
  pkgBlock: { gap: 8 },
  pkgTopRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  pkgIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pkgName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  pkgMaterial: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  depositBox: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 60 },
  depositNum: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  depositWord: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  returnRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  returnNote: { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 16 },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  returnBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  scheduledText: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 17 },
});
