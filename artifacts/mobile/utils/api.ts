import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns the base URL for API calls.
 * - In Replit dev: uses the shared proxy domain (from app.config.js extra)
 * - Fallback: empty string (relative URL, works if served from same origin)
 */
export function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  const replitDomain = extra?.replitDevDomain;
  if (replitDomain) {
    return `https://${replitDomain}`;
  }
  // On web, try relative — only works if same origin (won't work in Replit Expo dev)
  if (Platform.OS === 'web') return '';
  return '';
}

/**
 * Fire-and-forget API call — saves to backend but never blocks the UI.
 * The app works entirely without the backend via AsyncStorage.
 */
export async function apiPost(path: string, body: unknown): Promise<void> {
  const base = getApiBaseUrl();
  if (!base && Platform.OS !== 'web') return; // no URL available on native without domain
  try {
    await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent — offline-first app, API is best-effort
  }
}

export async function apiGet(path: string): Promise<unknown> {
  const base = getApiBaseUrl();
  if (!base && Platform.OS !== 'web') return null;
  try {
    const res = await fetch(`${base}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
