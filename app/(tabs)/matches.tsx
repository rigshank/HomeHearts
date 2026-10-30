import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, HText, Pill, Reveal, Screen, SectionHeading, StatusBadge } from '../../src/components/ui';
import { colors, radii, spacing } from '../../src/design/tokens';
import { DALLAS_PROGRAMS } from '../../src/data/programs';
import { getMatchResults, issueLabel } from '../../src/domain/matching';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../src/components/visuals';

export default function MatchesScreen() {
  const router = useRouter();
  const intake = useHomeHeartsStore((state) => state.intake);
  const setSelectedProgram = useHomeHeartsStore((state) => state.setSelectedProgram);
  if (!intake.issue) return <Screen><View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="sparkles-outline" size={26} color={colors.primary} /></View><HText variant="title">Let’s find your starting point.</HText><HText variant="body" color={colors.muted} style={styles.emptyBody}>Answer three quick questions so your Dallas matches are based on your actual situation.</HText><Button onPress={() => router.push('/intake')} icon="arrow-forward">Start intake</Button></View></Screen>;
  const results = getMatchResults(DALLAS_PROGRAMS, intake);
  const outsidePilot = Boolean(intake.zipCode && !/^75\d{3}$/.test(intake.zipCode));
  return <Screen><Reveal><View style={styles.header}><View><HText variant="micro" color={colors.primary}>YOUR DALLAS OPTIONS</HText><HText variant="title">A few places to start</HText></View><Pill tone="purple">{results.length} options</Pill></View><HText variant="body" color={colors.muted}>Based on {issueLabel(intake.issue)}. Transparent leads, not approvals.</HText></Reveal>{outsidePilot && <Card tone="coral" style={styles.coverageNotice}><Ionicons name="location-outline" size={18} color={colors.danger} /><HText variant="caption" color={colors.danger}>Dallas-first pilot · these are leads to verify.</HText></Card>}
    <View style={styles.trustCard}><Ionicons name="information-circle-outline" size={20} color={colors.primary} /><View style={styles.trustCopy}><HText variant="bodyStrong">Trust first</HText><HText variant="caption" color={colors.muted}>Availability changes. Every card shows when the source was last checked.</HText></View></View>
    {results.map((result, index) => <Reveal key={result.program.id} index={index}><Card style={styles.matchCard} onPress={() => { setSelectedProgram(result.program.id); router.push({ pathname: '/matches/[programId]', params: { programId: result.program.id } }); }}><View style={styles.cardTop}><Pill tone="purple">{result.score}% match</Pill><StatusBadge status={result.program.status} label={result.program.statusLabel} /></View><View style={styles.programRow}><VisualMark icon={programIcon(result.program.category)} size="small" label={`${result.program.category} support`} /><View style={styles.programCopy}><HText variant="headline">{result.program.name}</HText><HText variant="caption" color={colors.muted}>{result.program.provider}</HText></View></View><HText variant="caption" color={colors.muted}>{result.program.coverage} · {result.program.assistance.amountLabel}</HText><HText variant="micro" color={colors.muted}>CHECKED {result.program.verifiedAt}</HText><View style={styles.reasonBlock}>{result.matchedReasons.slice(0, 1).map((reason) => <View style={styles.reason} key={reason}><Ionicons name="checkmark-circle" size={15} color={colors.success} /><HText variant="caption" color={colors.mutedStrong}>{reason}</HText></View>)}{result.unknownReasons.slice(0, 1).map((reason) => <View style={styles.reason} key={reason}><Ionicons name="help-circle-outline" size={15} color={colors.warning} /><HText variant="caption" color={colors.warning}>{reason}</HText></View>)}</View><View style={styles.cardBottom}><HText variant="caption" color={colors.primary}>Details & documents</HText><Ionicons name="arrow-forward" size={18} color={colors.primary} /></View></Card></Reveal>)}
  </Screen>;
}

const PROGRAM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { rent: 'home-outline', utilities: 'flash-outline', shelter: 'shield-checkmark-outline', legal: 'document-text-outline', housing: 'business-outline', moving: 'navigate-outline', general: 'sparkles-outline' };
function programIcon(category: string): keyof typeof Ionicons.glyphMap { return PROGRAM_ICONS[category] ?? 'sparkles-outline'; }

const styles = StyleSheet.create({ empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: 160, paddingHorizontal: spacing.md }, emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, emptyBody: { textAlign: 'center', maxWidth: 320, marginBottom: spacing.sm }, header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.sm }, coverageNotice: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.lg }, trustCard: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primarySoft, marginTop: spacing.lg, marginBottom: spacing.lg }, trustCopy: { flex: 1, gap: 3 }, matchCard: { marginBottom: spacing.md, gap: spacing.sm }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, programRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, programCopy: { flex: 1, gap: 2 }, reasonBlock: { gap: spacing.xs, marginTop: spacing.xs }, reason: { flexDirection: 'row', gap: 6, alignItems: 'center' }, cardBottom: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

