import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, HText, Pill, Reveal, Screen, SectionHeading } from '../../src/components/ui';
import { IconRow, StepRail, VisualAction, VisualMark } from '../../src/components/visuals';
import { colors, radii, spacing } from '../../src/design/tokens';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';

export default function HomeScreen() {
  const router = useRouter();
  const planTasks = useHomeHeartsStore((state) => state.planTasks);
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const doneCount = planTasks.filter((task) => task.status === 'done').length;
  return <Screen>
    <Reveal><View style={styles.topline}><View><HText variant="micro" color={colors.primary}>HOMEHEARTS</HText><HText variant="caption" color={colors.muted}>A calmer next step for Dallas</HText></View><View style={styles.location}><Ionicons name="location-outline" size={15} color={colors.primary} /><HText variant="caption" color={colors.primary}>Dallas, TX</HText></View></View></Reveal>
    <Reveal index={1}><View style={styles.hero}><View style={styles.heroTop}><VisualMark icon="home-outline" label="HomeHearts housing help" /><HText variant="micro" color={colors.muted}>DALLAS FIRST</HText></View><HText variant="display">Find your next step.</HText><HText variant="body" color={colors.muted}>Housing help matched to what’s happening.</HText><Button icon="arrow-forward" onPress={() => router.push('/intake')}>Start with 3 questions</Button><View style={styles.trustLine}><Ionicons name="lock-closed-outline" size={14} color={colors.muted} /><HText variant="caption" color={colors.muted}>No account needed</HText></View></View></Reveal>
    <Reveal index={2}><View style={styles.stepsCard}><HText variant="micro" color={colors.primary}>A CALMER PATH</HText><StepRail steps={[{ icon: 'chatbubble-ellipses-outline', label: 'Tell us' }, { icon: 'sparkles-outline', label: 'See options' }, { icon: 'arrow-forward-circle-outline', label: 'Take a step' }]} /></View></Reveal>
    <Reveal index={3}><SectionHeading eyebrow="Start here" title="Choose a path" /></Reveal>
    <Reveal index={4}><View style={styles.actionGrid}><VisualAction tone="purple" icon="sparkles-outline" title="Find housing help" detail="LOCAL OPTIONS" onPress={() => router.push('/intake')} /><VisualAction tone="coral" icon="analytics-outline" title="Compare paths" detail="STAY OR MOVE" onPress={() => router.push('/compare')} /></View></Reveal>
    <Reveal index={5}><SectionHeading eyebrow="Keep going" title="Your saved plan" action={<Pill tone={selectedProgramId ? 'success' : 'neutral'}>{selectedProgramId ? `${doneCount}/${planTasks.length || 1}` : 'Not started'}</Pill>} /></Reveal>
    <Reveal index={6}><Card style={styles.planCard} onPress={() => router.push('/plan')}><IconRow icon="checkbox-outline" title={selectedProgramId ? 'Pick up your plan' : 'Your plan lives here'} detail={selectedProgramId ? `${doneCount} steps done · tap to continue` : 'Choose a match to get started'} /><Ionicons name="chevron-forward" size={20} color={colors.muted} style={styles.planChevron} /></Card></Reveal>
    <Reveal index={7}><View style={styles.trustNote}><Ionicons name="shield-checkmark-outline" size={18} color={colors.success} /><HText variant="caption" color={colors.muted}>Private demo · no approval promises.</HText></View></Reveal>
  </Screen>;
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }, location: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  hero: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg }, heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, stepsCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxl, gap: spacing.sm },
  actionGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl }, planCard: { marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, planChevron: { marginLeft: spacing.sm }, trustLine: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', paddingTop: spacing.xs }, trustNote: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingHorizontal: spacing.xs, marginBottom: spacing.lg },
});

