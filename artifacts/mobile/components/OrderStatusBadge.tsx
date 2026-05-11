import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type OrderStatus } from '@/context/AppContext';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Finding Rider', bg: '#FEF3C7', text: '#B45309' },
  picked_up: { label: 'On the Way', bg: '#DBEAFE', text: '#1D4ED8' },
  delivered: { label: 'Delivered', bg: '#DCFCE7', text: '#15803D' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#B91C1C' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
