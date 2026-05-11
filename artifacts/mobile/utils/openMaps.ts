import { Linking, Platform } from 'react-native';

/**
 * Opens the device's native maps app with the given address or coordinates.
 * Falls back to Google Maps web URL if the native app isn't available.
 * No API key required — uses deep linking only.
 */
export async function openMaps(address: string): Promise<void> {
  const encoded = encodeURIComponent(address);

  // Try platform-specific deep link first
  const nativeUrl =
    Platform.OS === 'ios'
      ? `maps://app?q=${encoded}`
      : `geo:0,0?q=${encoded}`;

  // Universal Google Maps web URL (opens app if installed, browser if not)
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  try {
    if (Platform.OS !== 'web') {
      const canOpen = await Linking.canOpenURL(nativeUrl);
      if (canOpen) {
        await Linking.openURL(nativeUrl);
        return;
      }
    }
    await Linking.openURL(webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}
