import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function Index() {
  const { currentUser, isLoading } = useApp();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
      router.replace('/auth/phone');
    } else if (currentUser.role === 'farmer') {
      router.replace('/(farmer)' as any);
    } else if (currentUser.role === 'rider') {
      router.replace('/(rider)' as any);
    } else {
      router.replace('/(tabs)' as any);
    }
  }, [currentUser, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
