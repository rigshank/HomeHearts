import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card, HText, Pill, Reveal, Screen, SectionHeading } from '../../src/components/ui';
import { IconRow, VisualMark } from '../../src/components/visuals';
import { colors, radii, spacing } from '../../src/design/tokens';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';
import { HomeFeatureRail } from '../../src/components/homeLanding';

export default function HomeScreen() {
  const router = useRouter();
  const planTasks = useHomeHeartsStore((state) => state.planTasks);
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const doneCount = planTasks.filter((task) => task.status === 'done').length;
  const { height } = useWindowDimensions();
  const compact = height <= 700;
  return <Screen>
    <Reveal><View style={styles.topline}><View><HText variant="micro" color={colors.primary}>HOMEHEARTS</HText><HText variant="caption" color={colors.muted}>A calmer next step for Dallas</HText></View><View style={styles.location}><Ionicons accessible={false} aria-hidden name="location-outline" size={15} color={colors.primary} /><HText variant="caption" color={colors.primary}>Dallas, TX</HText></View></View></Reveal>
    <Reveal index={1}><View style={[styles.hero, compact && styles.heroCompact]}><View style={styles.heroTop}><VisualMark icon="home-outline" size="medium" label="HomeHearts housing help" /><HText variant="micro" color={colors.muted}>DALLAS FIRST</HText></View><HText variant="display">Find your next step.</HText><HText variant="body" color={colors.muted}>Housing help matched to what’s happening.</HText><HomeFeatureRail hasPlan={Boolean(selectedProgramId)} onNavigate={(route) => router.push(route)} /><View style={styles.trustLine}><Ionicons accessible={false} aria-hidden name="lock-closed-outline" size={14} color={colors.muted} /><HText variant="caption" color={colors.muted}>No account needed</HText></View></View></Reveal>
    <Reveal index={2}><SectionHeading eyebrow="Keep going" title="Your saved plan" action={<Pill tone={selectedProgramId ? 'success' : 'neutral'}>{selectedProgramId ? `${doneCount}/${planTasks.length || 1}` : 'Not started'}</Pill>} /></Reveal>
    <Reveal index={3}><Card style={styles.planCard} onPress={() => router.push('/plan')}><IconRow icon="checkbox-outline" title={selectedProgramId ? 'Pick up your plan' : 'Your plan lives here'} detail={selectedProgramId ? `${doneCount} steps done · tap to continue` : 'Choose a match to get started'} /><Ionicons accessible={false} aria-hidden name="chevron-forward" size={20} color={colors.muted} style={styles.planChevron} /></Card></Reveal>
    <Reveal index={4}><View style={styles.trustNote}><Ionicons accessible={false} aria-hidden name="shield-checkmark-outline" size={18} color={colors.success} /><HText variant="caption" color={colors.muted}>Private demo · no approval promises.</HText></View></Reveal>
  </Screen>;
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, location: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  hero: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxl }, heroCompact: { padding: spacing.sm, gap: spacing.xs }, heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, planCard: { marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, planChevron: { marginLeft: spacing.sm }, trustLine: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', paddingTop: spacing.xs }, trustNote: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingHorizontal: spacing.xs, marginBottom: spacing.lg },
});

