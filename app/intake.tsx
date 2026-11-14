import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Field, FloatingBack, HText, IssueTile, OptionButton, ProgressBar, Reveal, Screen } from '../src/components/ui';
import { colors, spacing } from '../src/design/tokens';
import { DALLAS_PROGRAMS } from '../src/data/programs';
import { getLocationQuestions } from '../src/domain/matching';
import { COUNTY_LABELS, isZipCode } from '../src/domain/serviceArea';
import { IssueType, Urgency } from '../src/domain/types';
import { useHomeHeartsStore } from '../src/state/useHomeHeartsStore';
import { getIssueTileColumns } from '../src/components/visualLayout';

const issues: { value: IssueType; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'rent_increase', title: 'Rent went up', description: 'I need help staying in my current home.', icon: 'trending-up-outline' },
  { value: 'eviction', title: 'Eviction notice', description: 'I need to understand my options quickly.', icon: 'alert-circle-outline' },
  { value: 'utilities', title: 'Utility bills', description: 'Rent, electricity, water, or other bills.', icon: 'flash-outline' },
  { value: 'homeless', title: 'No stable place', description: 'I’m outside, couch surfing, or about to lose housing.', icon: 'home-outline' },
  { value: 'shelter', title: 'Safe place tonight', description: 'I need immediate shelter or crisis routing.', icon: 'shield-checkmark-outline' },
  { value: 'moving', title: 'Moving help', description: 'Deposit, moving costs, or finding a new place.', icon: 'navigate-outline' },
  { value: 'legal', title: 'Housing legal help', description: 'A landlord, lease, or eviction question.', icon: 'document-text-outline' },
  { value: 'domestic_violence', title: 'Unsafe home', description: 'I need a safe, private housing path.', icon: 'shield-outline' },
  { value: 'disability', title: 'Accessible housing', description: 'I need accessible or disability-linked help.', icon: 'accessibility-outline' },
  { value: 'veteran', title: 'Veteran housing', description: 'I need veteran-specific housing resources.', icon: 'ribbon-outline' },
  { value: 'youth', title: 'Youth housing', description: 'I need youth-focused support or shelter.', icon: 'people-outline' },
];
const urgencies: { value: Urgency; title: string; description: string }[] = [
  { value: 'today', title: 'Today', description: 'I need the fastest next step.' }, { value: 'this_week', title: 'This week', description: 'I have a little time, but need a plan.' }, { value: 'this_month', title: 'This month', description: 'I want to get ahead of the problem.' }, { value: 'planning', title: 'I’m planning ahead', description: 'I’m comparing options before I decide.' },
];

const STEP_TITLES = ['What’s happening?', 'How urgent is it?', 'Where should we look?'];
const STEP_HINTS = ['Pick the closest fit.', 'We’ll prioritize the next step.', 'Enter the ZIP code where you need help.'];

export default function IntakeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const intake = useHomeHeartsStore((state) => state.intake);
  const setIntake = useHomeHeartsStore((state) => state.setIntake);
  const { location } = useLocalSearchParams<{ location?: string }>();
  const [step, setStep] = useState(location === '1' ? 2 : 0);
  const questions = getLocationQuestions(DALLAS_PROGRAMS, intake);
  const needsCounty = questions.counties.length > 0;
  const canContinue = [
    Boolean(intake.issue),
    Boolean(intake.urgency),
    isZipCode(intake.zipCode) && (!needsCounty || Boolean(intake.county)) &&
      (!questions.askDallasCity || intake.insideDallas !== undefined),
  ][step];
  const issueColumns = getIssueTileColumns(width);

  function continueFlow() {
    if (step < 2) setStep(step + 1);
    else router.replace('/matches');
  }

  return (
    <Screen bottomAction={
      <Button disabled={!canContinue} onPress={continueFlow} icon={step === 2 ? 'sparkles-outline' : 'arrow-forward'}>
        {step === 2 ? 'Show my matches' : 'Continue'}
      </Button>
    }>
      <View style={styles.nav}><FloatingBack /></View>
      <Reveal>
        <HText variant="micro" color={colors.primary}>STEP {step + 1} OF 3</HText>
        <HText variant="title" style={styles.title}>{STEP_TITLES[step]}</HText>
        <HText variant="body" color={colors.muted}>{STEP_HINTS[step]}</HText>
        <ProgressBar value={(step + 1) / 3} />
      </Reveal>
      {step === 0 && (
        <View style={[styles.issueGrid, issueColumns === 1 && styles.issueGridSingle]}>
          {issues.map((issue, index) => (
            <View key={issue.value} style={[styles.issueTileWrap, issueColumns === 1 && styles.issueTileWrapSingle]}>
              <Reveal index={index}>
                <IssueTile icon={issue.icon} title={issue.title} accessibilityLabel={`${issue.title}. ${issue.description}`}
                  selected={intake.issue === issue.value} onPress={() => setIntake({ issue: issue.value })} />
              </Reveal>
            </View>
          ))}
        </View>
      )}
      {step === 1 && (
        <View style={styles.options}>
          {urgencies.map((urgency, index) => (
            <Reveal key={urgency.value} index={index}>
              <OptionButton title={urgency.title} description={urgency.description}
                selected={intake.urgency === urgency.value} onPress={() => setIntake({ urgency: urgency.value })} />
            </Reveal>
          ))}
        </View>
      )}
      {step === 2 && (
        <View style={styles.locationForm}>
          <Field label="ZIP code" keyboardType="number-pad" maxLength={5} placeholder="75201" value={intake.zipCode}
            onChangeText={(text) => setIntake({ zipCode: text.replace(/\D/g, '').slice(0, 5), county: undefined, insideDallas: undefined })} />
          {needsCounty && (
            <View style={styles.followUp}>
              <HText variant="bodyStrong">Which county are you in?</HText>
              <HText variant="caption" color={colors.muted}>This ZIP crosses county lines.</HText>
              {questions.counties.map((county) => (
                <OptionButton key={county} title={COUNTY_LABELS[county]} selected={intake.county === county}
                  onPress={() => setIntake({ county })} />
              ))}
              <OptionButton title="I’m not sure" selected={intake.county === 'unsure'} onPress={() => setIntake({ county: 'unsure' })} />
            </View>
          )}
          {questions.askDallasCity && (
            <View style={styles.followUp}>
              <HText variant="bodyStrong">Do you live inside Dallas city limits?</HText>
              <HText variant="caption" color={colors.muted}>This ZIP includes addresses outside the city.</HText>
              <OptionButton title="Yes" selected={intake.insideDallas === true} onPress={() => setIntake({ insideDallas: true })} />
              <OptionButton title="No" selected={intake.insideDallas === false} onPress={() => setIntake({ insideDallas: false })} />
              <OptionButton title="I’m not sure" selected={intake.insideDallas === 'unsure'} onPress={() => setIntake({ insideDallas: 'unsure' })} />
            </View>
          )}
          {intake.issue === 'rent_increase' && (
            <Field label="Rent increase amount (optional)" keyboardType="decimal-pad" placeholder="$150"
              value={intake.rentIncreaseCents ? String(intake.rentIncreaseCents / 100) : ''}
              onChangeText={(value) => setIntake({ rentIncreaseCents: parseMoney(value) })} />
          )}
          <View style={styles.privacy}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.success} />
            <HText variant="caption" color={colors.muted}>Private on this device in the demo.</HText>
          </View>
        </View>
      )}
    </Screen>
  );
}

function parseMoney(value: string) { const parsed = Number(value.replace(/[^0-9.]/g, '')); return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : undefined; }
const styles = StyleSheet.create({ nav: { marginBottom: spacing.lg }, title: { marginTop: spacing.xs, marginBottom: spacing.sm }, options: { marginTop: spacing.xl }, issueGrid: { marginTop: spacing.xl, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, issueGridSingle: { flexDirection: 'column' }, issueTileWrap: { width: '48%' }, issueTileWrapSingle: { width: '100%' }, locationForm: { marginTop: spacing.xl }, followUp: { gap: spacing.xs, marginBottom: spacing.md }, privacy: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, borderRadius: 14, backgroundColor: colors.successSoft, marginTop: spacing.sm },
});

