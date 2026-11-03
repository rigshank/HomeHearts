import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HText, Reveal, Screen } from './ui';
import { colors, spacing } from '../design/tokens';
import { useHomeHeartsStore } from '../state/useHomeHeartsStore';
import { HomeStartOptions } from './homeLanding';
import type { LandingRoute } from './homeLandingModel';
import { BrandMark } from './visuals';

export function HomeDashboardContent({ onNavigate }: { onNavigate: (route: LandingRoute) => void }) {
  const planTasks = useHomeHeartsStore((state) => state.planTasks);
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const doneCount = planTasks.filter((task) => task.status === 'done').length;
  return <View style={styles.content}>
    <Reveal><View style={styles.brandHeader}><BrandMark size="small" /><HText variant="headline">HomeHearts</HText></View></Reveal>
    <Reveal><View style={styles.heroIntro}><HText variant="micro" color={colors.primary}>A CALMER WAY FORWARD</HText><HText variant="display" style={styles.heroTitle}>How can we help?</HText></View></Reveal>
    <Reveal index={1}><HomeStartOptions hasPlan={Boolean(selectedProgramId)} onNavigate={onNavigate} /></Reveal>
    {selectedProgramId && <Reveal index={3}><Card style={styles.planCard} onPress={() => onNavigate('/plan')}><View style={styles.planIcon}><Ionicons accessible={false} aria-hidden name="checkbox-outline" size={20} color={colors.primary} /></View><View style={styles.planCopy}><HText variant="bodyStrong" numberOfLines={1}>Continue your plan</HText><HText variant="caption" color={colors.muted}>{doneCount} of {planTasks.length || 1} steps</HText></View><View style={styles.planProgress}><View style={[styles.planProgressFill, { width: `${planTasks.length ? Math.max(6, (doneCount / planTasks.length) * 100) : 6}%` }]} /></View><Ionicons accessible={false} aria-hidden name="arrow-forward" size={19} color={colors.primary} /></Card></Reveal>}
  </View>;
}

export default function HomeDashboard() {
  const router = useRouter();
  return <Screen backgroundVariant="home"><HomeDashboardContent onNavigate={(route) => router.push(route)} /></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.md },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  heroIntro: { gap: spacing.xs, marginBottom: spacing.lg },
  heroTitle: { maxWidth: 360 },
  planCard: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  planIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  planCopy: { flex: 1, minWidth: 0, gap: 2 },
  planProgress: { width: 62, height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  planProgressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
});
