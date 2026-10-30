import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HText, Pill, Reveal, Screen, SectionHeading } from '../../src/components/ui';
import { BrandMark, IconRow } from '../../src/components/visuals';
import { colors, spacing } from '../../src/design/tokens';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';
import { HomeStartOptions } from '../../src/components/homeLanding';

export default function HomeScreen() {
  const router = useRouter();
  const planTasks = useHomeHeartsStore((state) => state.planTasks);
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const doneCount = planTasks.filter((task) => task.status === 'done').length;
  return <Screen>
    <Reveal><View style={styles.topline}><View style={styles.brandIdentity}><BrandMark size="small" /><View style={styles.brandCopy}><HText variant="headline">HomeHearts</HText><HText variant="caption" color={colors.muted}>Dallas housing help</HText></View></View><View style={styles.location}><Ionicons accessible={false} aria-hidden name="location-outline" size={15} color={colors.brand} /><HText variant="caption" color={colors.brandDark}>Dallas</HText></View></View></Reveal>
    <Reveal index={1}><View style={styles.heroIntro}><HText variant="micro" color={colors.brandDark}>A CALMER WAY FORWARD</HText><HText variant="display" style={styles.heroTitle}>What do you need right now?</HText><HText variant="body" color={colors.muted}>Pick a starting point. You can save the rest for later.</HText></View></Reveal>
    <Reveal index={2}><HomeStartOptions hasPlan={Boolean(selectedProgramId)} onNavigate={(route) => router.push(route)} /></Reveal>
    {selectedProgramId ? <><Reveal index={3}><SectionHeading eyebrow="KEEP GOING" title="Your saved plan" action={<Pill tone="success">{`${doneCount}/${planTasks.length || 1}`}</Pill>} /></Reveal><Reveal index={4}><Card style={styles.planCard} onPress={() => router.push('/plan')}><IconRow icon="checkbox-outline" title="Pick up your plan" detail={`${doneCount} steps done · tap to continue`} /><Ionicons accessible={false} aria-hidden name="chevron-forward" size={20} color={colors.muted} style={styles.planChevron} /></Card></Reveal></> : <Reveal index={3}><View style={styles.saveNote}><Ionicons accessible={false} aria-hidden name="sparkles-outline" size={17} color={colors.brand} /><HText variant="caption" color={colors.mutedStrong}>No account needed · progress saves on this device.</HText></View></Reveal>}
    <Reveal index={5}><View style={styles.trustNote}><Ionicons accessible={false} aria-hidden name="shield-checkmark-outline" size={18} color={colors.success} /><HText variant="caption" color={colors.muted}>Private on this device · you stay in control.</HText></View></Reveal>
  </Screen>;
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }, brandIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, brandCopy: { flex: 1, minWidth: 0 }, location: { flexShrink: 0, flexDirection: 'row', gap: 4, alignItems: 'center', marginLeft: spacing.sm }, heroIntro: { gap: spacing.sm, marginBottom: spacing.md }, heroTitle: { maxWidth: 330 }, planCard: { marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, planChevron: { marginLeft: spacing.sm }, saveNote: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs }, trustNote: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingHorizontal: spacing.xs, marginBottom: spacing.lg },
});

