import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastBanner } from '@/components/ToastBanner';
import { AppProvider } from '@/context/AppContext';

// Conditionally import Vercel Analytics for web only
let Analytics: React.ComponentType | null = null;
if (Platform.OS === 'web') {
  try {
    const module = require('@vercel/analytics/react');
    Analytics = module.Analytics;
  } catch (e) {
    // Analytics not available, continue without it
  }
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth/phone" options={{ animation: 'fade' }} />
      <Stack.Screen name="auth/otp" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="auth/profile" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="auth/role" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="auth/rider-id" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(farmer)" />
      <Stack.Screen name="(rider)" />
      <Stack.Screen
        name="listing/[id]"
        options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="checkout/address"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="farmpass"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
    <ToastBanner />
    {Analytics && <Analytics />}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
