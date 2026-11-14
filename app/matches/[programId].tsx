import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, FloatingBack, HText, Pill, Reveal, Screen, SectionHeading, StatusBadge } from '../../src/components/ui';
import { MetricTile, VisualMark } from '../../src/components/visuals';
import { PROGRAMS } from '../../src/data/programs';
import { colors, spacing } from '../../src/design/tokens';
import { getMatchResults, getProgramAvailability } from '../../src/domain/matching';
import { DOCUMENT_LABELS, Program } from '../../src/domain/types';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';

const SERVICE_LABELS: Record<Program['kind'], string> = {
  direct: 'Direct service',
  referral: 'Referral',
  long_term: 'Long-term housing',
};

export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const intake = useHomeHeartsStore((state) => state.intake);
  const [linkFeedback, setLinkFeedback] = useState<string | null>(null);
  const program = PROGRAMS.find((item) => item.id === programId);
  if (!program) {
    return <Screen><FloatingBack /><HText variant="title">This program is unavailable.</HText>
      <Button onPress={() => router.replace('/matches')}>Back to matches</Button></Screen>;
  }
  const now = new Date();
  const availability = getProgramAvailability(program, now);
  const { actionable, later } = getMatchResults([program], intake, now);
  const match = actionable[0] ?? later[0];
  const { phone, intakeUrl } = program;
  const canPrepare = program.kind === 'direct' && availability.status !== 'closed';

  async function openLink(url: string, fallback: string) {
    setLinkFeedback(null);
    try {
      await Linking.openURL(url);
    } catch {
      setLinkFeedback(fallback);
    }
  }

  function callProvider(phone: string) {
    return openLink('tel:' + phone.replace(/[^0-9+]/g, ''), 'Calling is unavailable here. Use ' + phone + '.');
  }

  return (
    <Screen>
      <View style={styles.nav}><FloatingBack /></View>
      <Reveal>
        <View style={styles.badges}>
          <Pill tone="purple">{SERVICE_LABELS[program.kind]}</Pill>
          <StatusBadge status={availability.status} label={availability.label} />
        </View>
        <View style={styles.titleRow}>
          <VisualMark icon="home-outline" size="small" label="Housing resource" />
          <View style={styles.titleCopy}>
            <HText variant="title">{program.name}</HText>
            <HText variant="caption" color={colors.muted}>{program.provider}</HText>
          </View>
        </View>
        <HText variant="body" color={colors.muted} style={styles.description}>{program.description}</HText>
      </Reveal>

      <SectionHeading title="Next step" />
      <Card tone="purple" style={styles.sectionCard}>
        {availability.timing && <HText variant="bodyStrong">{availability.timing}</HText>}
        <HText variant="body">{availability.status === 'call_to_verify' && program.status !== 'call_to_verify'
          ? 'Check current intake on the official page before preparing an application.'
          : program.nextStep}</HText>
        {phone && (
          <Button icon="call-outline" onPress={() => void callProvider(phone)}>Call {phone}</Button>
        )}
        {intakeUrl && availability.status !== 'closed' && (
          <Button variant="secondary" icon="open-outline"
            onPress={() => void openLink(intakeUrl, 'Couldn’t open intake. Try the official source below.')}>Open provider intake</Button>
        )}
        <Button variant="ghost" icon="open-outline"
          onPress={() => void openLink(program.sourceUrl, 'Couldn’t open the official source: ' + program.sourceUrl)}>Open official source</Button>
        {linkFeedback && <HText variant="caption" color={colors.danger}>{linkFeedback}</HText>}
      </Card>

      <Card style={styles.sectionCard}>
        <HText variant="bodyStrong">{match ? 'Why this is here' : 'Service area'}</HText>
        {match ? match.matchedReasons.map((reason) => <HText key={reason} variant="caption">{reason}</HText>)
          : <HText variant="caption">{program.coverage}</HText>}
        {match?.unknownReasons.map((reason) => <HText key={reason} variant="caption" color={colors.warning}>{reason}</HText>)}
        <HText variant="bodyStrong">Source and date checked</HText>
        <HText variant="caption" color={colors.muted}>{program.sourceLabel} · {program.verificationMethod === 'provider_website' ? 'Website reviewed' : 'Reviewed'} {program.verifiedAt}</HText>
        <HText variant="caption" color={colors.muted}>{program.verificationNote}</HText>
      </Card>

      <SectionHeading title="What this service offers" />
      <View style={styles.assistanceGrid}>
        <MetricTile icon="cash-outline" label="Help" value={program.assistance.amountLabel} />
        <MetricTile icon="time-outline" label="Timing" value={program.assistance.durationLabel} tone="neutral" />
        <MetricTile icon="arrow-forward-circle-outline" label="How" value={program.assistance.methodLabel} tone="coral" />
      </View>

      <SectionHeading title="Eligibility and documents" />
      <Card style={styles.sectionCard}>
        {program.eligibility.map((item) => (
          <View key={item} style={styles.bullet}>
            <Ionicons name="checkmark-circle-outline" size={17} color={colors.success} />
            <HText style={styles.bulletText} variant="caption">{item}</HText>
          </View>
        ))}
        {(program.requiredDocuments.length > 0 || program.documentNote) && <HText variant="bodyStrong">Documents</HText>}
        {program.requiredDocuments.map((kind) => <HText key={kind} variant="caption">{DOCUMENT_LABELS[kind]}</HText>)}
        {program.documentNote && <HText variant="caption" color={colors.muted}>{program.documentNote}</HText>}
        {canPrepare && (
          <Button icon="document-attach-outline"
            onPress={() => router.push({ pathname: '/matches/[programId]/application', params: { programId: program.id } })}>
            {program.requiredDocuments.length ? 'Prepare documents' : 'Plan my next step'}
          </Button>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: { marginBottom: spacing.lg },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  titleCopy: { flex: 1, gap: spacing.xs },
  description: { marginVertical: spacing.md },
  sectionCard: { gap: spacing.sm, marginBottom: spacing.lg },
  assistanceGrid: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  bullet: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bulletText: { flex: 1 },
});
