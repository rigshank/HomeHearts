import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, HText, Pill, Reveal, Screen, StatusBadge } from '../../src/components/ui';
import { colors, spacing } from '../../src/design/tokens';
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
  return <Screen><Reveal><View style={styles.header}><View style={styles.headerCopy}><HText variant="micro" color={colors.primary}>YOUR DALLAS OPTIONS</HText><HText variant="title" numberOfLines={1}>A few places to start</HText></View><Pill tone="purple">{results.length} leads</Pill></View><HText variant="caption" color={colors.muted} numberOfLines={1}>Matched to {issueLabel(intake.issue).toLowerCase()}.</HText></Reveal>
    <Reveal index={1}><View style={styles.contextRail}><View style={styles.contextIcon}><Ionicons name="location-outline" size={17} color={colors.primary} /></View><View style={styles.contextCopy}><HText variant="micro" color={colors.primaryDark}>DALLAS-FIRST PILOT</HText><HText variant="caption" color="#6A6090" numberOfLines={1}>{outsidePilot ? 'Outside pilot area · call to verify.' : 'Leads to verify before you apply.'}</HText></View><Ionicons name="chevron-forward" size={17} color={colors.primary} /></View></Reveal>
    {results.map((result, index) => <Reveal key={result.program.id} index={index + 2}><Card style={styles.matchCard} onPress={() => { setSelectedProgram(result.program.id); router.push({ pathname: '/matches/[programId]', params: { programId: result.program.id } }); }}><View style={styles.cardTop}><Pill tone="purple">{result.score}% match</Pill><StatusBadge status={result.program.status} label={result.program.statusLabel} /></View><View style={styles.programRow}><VisualMark icon={programIcon(result.program.category)} size="small" label={`${result.program.category} support`} /><View style={styles.programCopy}><HText variant="headline" numberOfLines={2}>{result.program.name}</HText><HText variant="caption" color={colors.muted} numberOfLines={1}>{result.program.provider}</HText></View></View><View style={styles.sourceRow}><Ionicons name="location-outline" size={14} color={colors.muted} /><HText variant="caption" color={colors.mutedStrong} numberOfLines={1}>{result.program.coverage}</HText><HText variant="micro" color={colors.muted} numberOfLines={1}>CHECKED {result.program.verifiedAt}</HText></View>{result.matchedReasons.slice(0, 1).map((reason) => <View style={styles.reason} key={reason}><Ionicons name="checkmark-circle" size={15} color={colors.success} /><HText variant="caption" color={colors.mutedStrong} numberOfLines={1} style={styles.reasonCopy}>{reason}</HText></View>)}{result.unknownReasons.slice(0, 1).map((reason) => <View style={styles.reason} key={reason}><Ionicons name="help-circle-outline" size={15} color={colors.warning} /><HText variant="caption" color={colors.warning} numberOfLines={1} style={styles.reasonCopy}>{reason}</HText></View>)}<View style={styles.cardBottom}><HText variant="bodyStrong" color={colors.primary}>View details</HText><View style={styles.cardArrow}><Ionicons name="arrow-forward" size={17} color={colors.white} /></View></View></Card></Reveal>)}
  </Screen>;
}

const PROGRAM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { rent: 'home-outline', utilities: 'flash-outline', shelter: 'shield-checkmark-outline', legal: 'document-text-outline', housing: 'business-outline', moving: 'navigate-outline', general: 'sparkles-outline' };
function programIcon(category: string): keyof typeof Ionicons.glyphMap { return PROGRAM_ICONS[category] ?? 'sparkles-outline'; }

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: 160, paddingHorizontal: spacing.md },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyBody: { textAlign: 'center', maxWidth: 320, marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  contextRail: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md, padding: spacing.md, borderRadius: 18, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#DCCFFF' },
  contextIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center' },
  contextCopy: { flex: 1, minWidth: 0, gap: 2 },
  matchCard: { marginBottom: spacing.md, padding: spacing.md, gap: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  programRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programCopy: { flex: 1, minWidth: 0, gap: 2 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  reason: { flexDirection: 'row', gap: 6, alignItems: 'center', minWidth: 0 },
  reasonCopy: { flex: 1 },
  cardBottom: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
