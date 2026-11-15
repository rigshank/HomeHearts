import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../design/tokens';
import { CatalogSource, useCatalogStore } from '../state/useCatalogStore';
import { Button, HText } from './ui';

export function formatCatalogDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function describeCatalogSource(source: CatalogSource, failed: boolean) {
  if (source === 'remote') return { icon: 'cloud-done-outline' as const, title: 'Provider list up to date', detail: 'Synced from the HomeHearts catalog on GitHub.' };
  if (source === 'cache') return { icon: 'cloud-offline-outline' as const, title: 'Showing your saved provider list', detail: failed ? 'Couldn’t reach GitHub, so this is the last copy that downloaded.' : 'Checking GitHub for a newer copy.' };
  return { icon: 'phone-portrait-outline' as const, title: 'Showing the built-in provider list', detail: failed ? 'Couldn’t reach GitHub, so this is the copy that came with the app.' : 'Checking GitHub for a newer copy.' };
}

export function CatalogStatus() {
  const source = useCatalogStore((state) => state.source);
  const lastUpdated = useCatalogStore((state) => state.lastUpdated);
  const syncing = useCatalogStore((state) => state.syncing);
  const error = useCatalogStore((state) => state.error);
  const refresh = useCatalogStore((state) => state.refresh);
  const info = describeCatalogSource(source, Boolean(error));
  return (
    <View style={styles.row} accessibilityRole="summary">
      <Ionicons accessible={false} aria-hidden name={syncing ? 'sync-outline' : info.icon} size={20} color={source === 'remote' ? colors.success : colors.muted} />
      <View style={styles.copy}>
        <HText variant="caption" color={colors.mutedStrong}>{syncing && source !== 'remote' ? 'Updating provider list…' : info.title}</HText>
        <HText variant="micro" color={colors.muted}>{info.detail} Catalog dated {formatCatalogDate(lastUpdated)}.</HText>
      </View>
      <Button variant="ghost" icon="refresh-outline" disabled={syncing} onPress={() => void refresh()} accessibilityLabel="Refresh provider list" style={styles.refresh}>Refresh</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  refresh: { minHeight: 44, paddingHorizontal: spacing.xs },
});
