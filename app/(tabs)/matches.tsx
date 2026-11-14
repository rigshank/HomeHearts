import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, HText, Reveal, Screen, SectionHeading, StatusBadge } from '../../src/components/ui';
import { VisualMark } from '../../src/components/visuals';
import { DALLAS_PROGRAMS } from '../../src/data/programs';
import { colors, spacing } from '../../src/design/tokens';
import { getLocationQuestions, getMatchResults, getProgramAvailability, issueLabel } from '../../src/domain/matching';
import { getZipArea } from '../../src/domain/serviceArea';
import { MatchResult, Program } from '../../src/domain/types';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';

export default function MatchesScreen() {
  const router = useRouter();
  const intake = useHomeHeartsStore((state) => state.intake);
  const setSelectedProgram = useHomeHeartsStore((state) => state.setSelectedProgram);
  const now = new Date();
  const results = getMatchResults(DALLAS_PROGRAMS, intake, now);
  if (!results.referral) {
    return (
      <Screen>
        <View style={styles.empty}>
          <HText variant="title">Find your starting point</HText>
          <HText variant="body" color={colors.muted}>Tell us what you need, how soon, and where to look.</HText>
          <Button onPress={() => router.push('/intake')} icon="arrow-forward">Start intake</Button>
        </View>
      </Screen>
    );
  }

  const questions = getLocationQuestions(DALLAS_PROGRAMS, intake);
  const locationUncertain =
    (questions.counties.length > 0 && (!intake.county || intake.county === 'unsure')) ||
    (questions.askDallasCity && (intake.insideDallas === undefined || intake.insideDallas === 'unsure'));
  const location = getZipArea(intake.zipCode);
  const referral = results.referral;

  function openProgram(program: Program) {
    setSelectedProgram(program.id);
    router.push({ pathname: '/matches/[programId]', params: { programId: program.id } });
  }

  return (
    <Screen>
      <Reveal>
        <HText variant="micro" color={colors.primary}>RESOURCES FOR {intake.zipCode}</HText>
        <HText variant="title" style={styles.title}>Your housing options</HText>
        <HText variant="body" color={colors.muted}>Based on {issueLabel(intake.issue)} and when you need help. Each provider checks eligibility.</HText>
        <Button variant="ghost" icon="location-outline" style={styles.locationButton}
          onPress={() => router.push({ pathname: '/intake', params: { location: '1' } })}>Edit location</Button>
      </Reveal>
      {locationUncertain && (
        <Card tone="purple" style={styles.notice}>
          <HText variant="caption">Your ZIP crosses a service boundary. Confirm your location to see more options.</HText>
        </Card>
      )}
      {results.actionable.length > 0 ? (
        <>
          <SectionHeading title="Start here" />
          {results.actionable.map((match, index) => (
            <Reveal key={match.program.id} index={index}>
              <ProgramCard match={match} now={now} onPress={() => openProgram(match.program)} />
            </Reveal>
          ))}
        </>
      ) : (
        <Card style={styles.notice}>
          <HText variant="bodyStrong">No matching intake options in this catalog</HText>
          <HText variant="caption" color={colors.muted}>
            {location.inTexas ? '2-1-1 Texas can look for other services by ZIP and need.' : 'Use the local 211 directory for help in your area.'}
          </HText>
        </Card>
      )}
      <SectionHeading title="Help finding more options" />
      <ProgramCard now={now} match={{ program: referral, matchedReasons: [], unknownReasons: [] }}
        onPress={() => openProgram(referral)} />
      {results.later.length > 0 && (
        <>
          <SectionHeading title="Options for later" />
          {results.later.map((match) => (
            <ProgramCard key={match.program.id} now={now} match={match} onPress={() => openProgram(match.program)} />
          ))}
        </>
      )}
    </Screen>
  );
}

const PROGRAM_ICONS: Record<Program['category'], keyof typeof Ionicons.glyphMap> = {
  rent: 'home-outline', utilities: 'flash-outline', shelter: 'shield-checkmark-outline', legal: 'document-text-outline',
  housing: 'business-outline', moving: 'navigate-outline', general: 'sparkles-outline',
};

function ProgramCard({ match, now, onPress }: { match: MatchResult; now: Date; onPress: () => void }) {
  const { program } = match;
  const availability = getProgramAvailability(program, now);
  return (
    <Card style={styles.matchCard} onPress={onPress}>
      <View style={styles.status}><StatusBadge status={availability.status} label={availability.label} /></View>
      <View style={styles.programRow}>
        <VisualMark icon={PROGRAM_ICONS[program.category]} size="small" label={program.category + ' support'} />
        <View style={styles.programCopy}>
          <HText variant="headline">{program.name}</HText>
          <HText variant="caption" color={colors.muted}>{program.provider}</HText>
        </View>
      </View>
      <HText variant="caption" color={colors.mutedStrong}>{program.coverage} · {program.assistance.amountLabel}</HText>
      {match.matchedReasons[0] && <HText variant="caption">{match.matchedReasons[0]}</HText>}
      {match.unknownReasons.map((reason) => <HText key={reason} variant="caption" color={colors.warning}>{reason}</HText>)}
      {availability.timing && <HText variant="caption">{availability.timing}</HText>}
      <HText variant="micro" color={colors.muted}>SOURCE CHECKED {program.verifiedAt}</HText>
      <View style={styles.cardBottom}>
        <HText variant="caption" color={colors.primary}>Details & next step</HText>
        <Ionicons name="arrow-forward" size={20} color={colors.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: { gap: spacing.md, paddingTop: 160 },
  title: { marginTop: spacing.xs, marginBottom: spacing.sm },
  locationButton: { alignSelf: 'flex-start', marginTop: spacing.sm, marginBottom: spacing.md },
  notice: { gap: spacing.xs, marginBottom: spacing.md },
  matchCard: { marginBottom: spacing.md, gap: spacing.sm },
  status: { alignSelf: 'flex-start' },
  programRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  programCopy: { flex: 1, gap: 2 },
  cardBottom: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
