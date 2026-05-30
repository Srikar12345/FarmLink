import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { AppEvents, type OrderStatusEvent } from '@/utils/events';

type Toast = {
  id: string;
  status: string;
  produceName: string;
  riderName?: string;
};

type ToastContent = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  title: string;
  message: string;
};

function getContent(toast: Toast): ToastContent | null {
  switch (toast.status) {
    case 'picked_up':
      return {
        icon: 'motorbike',
        color: '#2563EB',
        title: 'Order on the way!',
        message: toast.riderName
          ? `${toast.riderName} picked up ${toast.produceName}`
          : `${toast.produceName} has been picked up`,
      };
    case 'rider_navigating':
      return {
        icon: 'map-marker-distance',
        color: '#7C3AED',
        title: 'Rider is navigating!',
        message: toast.riderName
          ? `${toast.riderName} started navigating to location`
          : 'Rider started navigating to location',
      };
    case 'delivered':
      return {
        icon: 'check-circle',
        color: '#16A34A',
        title: 'Order delivered!',
        message: `Your ${toast.produceName} has arrived`,
      };
    case 'cancelled':
      return {
        icon: 'close-circle',
        color: '#DC2626',
        title: 'Order cancelled',
        message: `${toast.produceName} order was cancelled`,
      };
    default:
      return null;
  }
}

export function ToastBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<Toast | null>(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRef = useRef<Toast | null>(null);
  currentRef.current = current;

  const showToast = (toast: Toast) => {
    if (timer.current) clearTimeout(timer.current);
    setCurrent(toast);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 110,
      friction: 12,
    }).start();

    timer.current = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 320,
        useNativeDriver: true,
      }).start(() => {
        setCurrent(null);
      });
    }, 4500);
  };

  useEffect(() => {
    const unsub = AppEvents.on('order:status', (payload: OrderStatusEvent) => {
      if (['picked_up', 'delivered', 'cancelled', 'rider_navigating'].includes(payload.status)) {
        showToast({
          id: `${payload.orderId}_${payload.status}`,
          status: payload.status,
          produceName: payload.produceName,
          riderName: payload.riderName,
        });
      }
    });
    return unsub;
  }, []);

  if (!current) return null;
  const content = getContent(current);
  if (!content) return null;

  const topPad = Platform.OS === 'web' ? 72 : insets.top + 12;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.card,
          borderColor: content.color + '35',
          top: topPad,
          shadowColor: content.color,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.iconCircle, { backgroundColor: content.color + '18' }]}>
        <MaterialCommunityIcons name={content.icon} size={22} color={content.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: content.color }]}>{content.title}</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={1}>
          {content.message}
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: content.color + '18' }]}>
        <View style={[styles.pillDot, { backgroundColor: content.color }]} />
        <Text style={[styles.pillText, { color: content.color }]}>Live</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    zIndex: 9999,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  message: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 0,
  },
  pillDot: { width: 5, height: 5, borderRadius: 3 },
  pillText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
});
