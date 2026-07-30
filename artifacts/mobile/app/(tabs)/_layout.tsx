import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { useColors } from '@/hooks/useColors';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'storefront', selected: 'storefront.fill' }} />
        <Label>Browse</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="b2b">
        <Icon sf={{ default: 'building.2', selected: 'building.2.fill' }} />
        <Label>Business</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="requests">
        <Icon sf={{ default: 'text.badge.plus', selected: 'text.badge.plus' }} />
        <Label>Requests</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        <Label>Orders</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person.circle', selected: 'person.circle.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="storefront" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="store-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="b2b"
        options={{
          title: 'Business',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="building.2" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="storefront-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="text.badge.plus" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="seed-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bag" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="shopping-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.circle" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="account-circle-outline" size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
