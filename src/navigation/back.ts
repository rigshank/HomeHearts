import type { Href, router } from 'expo-router';

export function goBackSafely(navigation: Pick<typeof router, 'canGoBack' | 'back' | 'replace'>, fallback: Href = '/(tabs)') {
  if (navigation.canGoBack()) navigation.back();
  else navigation.replace(fallback);
}
