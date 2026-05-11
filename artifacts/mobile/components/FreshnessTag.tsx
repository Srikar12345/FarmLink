import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FreshnessTagProps {
  harvestTime: string;
}

export function FreshnessTag({ harvestTime }: FreshnessTagProps) {
  const now = Date.now();
  const harvested = new Date(harvestTime).getTime();
  const diffMs = now - harvested;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  let label = '';
  let textColor = '#15803D';
  let bgColor = '#DCFCE7';

  if (diffMins < 60) {
    label = `${diffMins}m ago`;
  } else if (diffHours < 12) {
    label = `${diffHours}h ago`;
  } else if (diffHours < 24) {
    label = `${diffHours}h ago`;
    textColor = '#B45309';
    bgColor = '#FEF3C7';
  } else {
    const days = Math.floor(diffHours / 24);
    label = `${days}d ago`;
    textColor = '#B91C1C';
    bgColor = '#FEE2E2';
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Harvested {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
