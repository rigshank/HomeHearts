import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../design/tokens';
import { formatCurrency } from '../domain/cost';
import { BEDROOM_OPTIONS, getRentBenchmark } from '../domain/rentBenchmark';
import { isZipCode } from '../domain/serviceArea';
import { Button, Card, Field, HText, SectionHeading } from './ui';

// Lets someone planning a move look up what HUD lists as a fair rent in a ZIP
// code and drop it into "Monthly cost after move".
export function RentBenchmarkCard({ initialZip, onUse }: { initialZip: string; onUse: (cents: number) => void }) {
  const [zip, setZip] = useState(isZipCode(initialZip) ? initialZip : '');
  const [bedrooms, setBedrooms] = useState(1);
  const [applied, setApplied] = useState<number | null>(null);
  const benchmark = getRentBenchmark(zip, bedrooms);
  const bedroomLabel = BEDROOM_OPTIONS.find((option) => option.value === bedrooms)?.label ?? '';
  const isApplied = benchmark !== null && applied === benchmark.cents;

  return (
    <Card style={styles.card}>
      <SectionHeading eyebrow="HUD RENT BENCHMARK" title="Planning a move?" />
      <HText variant="caption" color={colors.muted}>See what HUD lists as a fair monthly rent in a ZIP code, then use it as your cost after moving.</HText>
      <Field label="ZIP code to look at" keyboardType="number-pad" maxLength={5} placeholder="75201" value={zip}
        onChangeText={(text) => { setZip(text.replace(/\D/g, '').slice(0, 5)); setApplied(null); }} />
      <View accessibilityRole="radiogroup" accessibilityLabel="Bedrooms" style={styles.chips}>
        {BEDROOM_OPTIONS.map((option) => {
          const selected = option.value === bedrooms;
          return (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ selected }}
              onPress={() => { setBedrooms(option.value); setApplied(null); }}
              style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
              <HText variant="caption" color={selected ? colors.primaryDark : colors.mutedStrong}>{option.label}</HText>
            </Pressable>
          );
        })}
      </View>

      {benchmark ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <HText variant="title">{formatCurrency(benchmark.cents)}<HText variant="caption" color={colors.muted}> / month</HText></HText>
          <HText variant="caption" color={colors.muted}>HUD benchmark for a {bedroomLabel.toLowerCase()} in {zip}</HText>
          <Button variant="secondary" icon={isApplied ? 'checkmark' : 'arrow-down-outline'} onPress={() => { onUse(benchmark.cents); setApplied(benchmark.cents); }}>
            {isApplied ? 'Added to monthly cost after move' : 'Use as monthly cost after move'}
          </Button>
        </View>
      ) : isZipCode(zip) ? (
        <View style={styles.note} accessibilityLiveRegion="polite">
          <Ionicons accessible={false} aria-hidden name="information-circle-outline" size={16} color={colors.warning} />
          <HText variant="caption" color={colors.warning} style={styles.noteText}>No HUD figure for {zip}. This demo covers Texas ZIP codes.</HText>
        </View>
      ) : null}

      <HText variant="micro" color={colors.muted}>
        Source: HUD Small Area Fair Market Rents, FY2027. HUD uses this benchmark for housing vouchers. It isn’t an average of current listings, so real rents can differ.
      </HText>
      <Button variant="ghost" icon="open-outline" onPress={() => void Linking.openURL('https://www.huduser.gov/portal/datasets/fmr.html').catch(() => undefined)} style={styles.sourceLink}>View HUD source</Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { minHeight: 44, minWidth: 62, paddingHorizontal: spacing.md, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.78 },
  result: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  note: { flexDirection: 'row', gap: 5, alignItems: 'flex-start' },
  noteText: { flex: 1 },
  sourceLink: { alignSelf: 'flex-start' },
});
