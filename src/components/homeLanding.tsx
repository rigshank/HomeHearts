import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { colors, radii, spacing } from '../design/tokens';
import { Button, HText, IconButton } from './ui';
import { CompactSurface, IconRow, MetricTile, VisualMark } from './visuals';
import { getLandingFeature, getLandingRoute, LANDING_FEATURES, LandingRoute } from './homeLandingModel';

export function HomeFeatureRail({ hasPlan, onNavigate }: { hasPlan: boolean; onNavigate: (route: LandingRoute) => void }) {
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const compact = height <= 700;
  const [activeIndex, setActiveIndex] = useState(0);
  useFocusEffect(useCallback(() => {
    setActiveIndex(0);
  }, []));
  const feature = getLandingFeature(activeIndex);
  const move = (direction: -1 | 1) => setActiveIndex((current) => (current + direction + LANDING_FEATURES.length) % LANDING_FEATURES.length);

  return <View style={[styles.rail, compact && styles.compactRail]}>
    <View style={styles.previewStack}>
      <View style={[styles.previewLayer, styles.previewLayerBack]} />
      <View style={[styles.previewLayer, styles.previewLayerMid]} />
      <Animated.View key={feature.id} entering={reduceMotion ? undefined : FadeInDown.duration(240)} style={[styles.previewCard, compact && styles.compactPreviewCard]}>
        <View style={styles.previewHeader}><VisualMark icon={feature.icon} tone={feature.tone} size="small" label={`${feature.title} preview`} /><View style={styles.previewHeaderCopy}><HText variant="micro" color={colors.primary}>{feature.eyebrow}</HText><HText variant="headline">{feature.title}</HText></View><HText variant="micro" color={colors.muted}>{activeIndex + 1}/{LANDING_FEATURES.length}</HText></View>
        {!compact && <HText variant="caption" color={colors.muted} style={styles.featureDetail}>{feature.detail}</HText>}
        <FeaturePreview featureId={feature.id} compact={compact} />
      </Animated.View>
    </View>
    <View style={styles.controls}><IconButton icon="chevron-back" label="Previous landing feature" onPress={() => move(-1)} background={colors.surface} /><View style={styles.pager}>{LANDING_FEATURES.map((item, index) => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={`${item.title}, feature ${index + 1} of ${LANDING_FEATURES.length}`} accessibilityState={{ selected: index === activeIndex }} onPress={() => setActiveIndex(index)} style={styles.pagerButton}><View style={[styles.dot, index === activeIndex && styles.dotActive]} /></Pressable>)}</View><IconButton icon="chevron-forward" label="Next landing feature" onPress={() => move(1)} background={colors.surface} /></View>
    <Button icon="arrow-forward" style={compact ? styles.compactCta : undefined} onPress={() => onNavigate(getLandingRoute(feature.id, hasPlan))}>{feature.cta}</Button>
  </View>;
}

function FeaturePreview({ featureId, compact = false }: { featureId: 'help' | 'compare' | 'call'; compact?: boolean }) {
  if (featureId === 'help') return <View style={styles.helpPreview}><View style={styles.chipRow}><CompactSurface tone="purple" style={styles.issueChip}><Ionicons accessible={false} aria-hidden name="home-outline" size={14} color={colors.primary} /><HText variant="micro" color={colors.primaryDark}>Rent</HText></CompactSurface><CompactSurface tone="coral" style={styles.issueChip}><Ionicons accessible={false} aria-hidden name="flash-outline" size={14} color={colors.coral} /><HText variant="micro" color={colors.coral}>Bills</HText></CompactSurface><CompactSurface tone="neutral" style={styles.issueChip}><Ionicons accessible={false} aria-hidden name="shield-checkmark-outline" size={14} color={colors.mutedStrong} /><HText variant="micro" color={colors.mutedStrong}>Safe place</HText></CompactSurface></View><View style={styles.statusRow}><Ionicons accessible={false} aria-hidden name="sparkles-outline" size={18} color={colors.primary} /><View style={styles.statusCopy}><HText variant="bodyStrong">Ready when you are</HText><HText variant="caption" color={colors.muted}>Three questions · Dallas first</HText></View></View></View>;
  if (featureId === 'compare') return <View style={styles.comparePreview}>{compact ? <View style={styles.compactMetricRow}><CompactSurface tone="purple" style={styles.compactMetric}><HText variant="micro" color={colors.primaryDark}>STAY</HText><HText variant="caption" color={colors.mutedStrong}>Monthly total</HText></CompactSurface><CompactSurface tone="coral" style={styles.compactMetric}><HText variant="micro" color={colors.coral}>MOVE</HText><HText variant="caption" color={colors.mutedStrong}>Up-front + monthly</HText></CompactSurface></View> : <View style={styles.metricRow}><MetricTile icon="home-outline" label="Stay" value="Monthly total" tone="purple" truncateValue={false} /><MetricTile icon="navigate-outline" label="Move" value="Up-front + monthly" tone="coral" truncateValue={false} /></View>}<View style={styles.compareBar}><View style={styles.compareBarLabel}><HText variant="micro" color={colors.muted}>YOUR NUMBERS</HText><HText variant="caption" color={colors.mutedStrong}>Add yours to compare</HText></View><View style={styles.barTrack}><View style={styles.barStay} /><View style={styles.barMove} /></View></View></View>;
  return <View style={styles.callPreview}><IconRow icon="document-text-outline" title="Documents" detail="Add when ready" tone="purple" truncateText={false} /><IconRow icon="chatbubble-ellipses-outline" title="Call script" detail="Build your questions" tone="success" truncateText={false} /></View>;
}

const styles = StyleSheet.create({
  rail: { gap: spacing.sm, marginBottom: spacing.sm }, compactRail: { gap: spacing.xs, marginBottom: spacing.xs },
  previewStack: { position: 'relative', paddingTop: spacing.xs, paddingHorizontal: spacing.xs },
  previewLayer: { position: 'absolute', left: spacing.md, right: spacing.md, top: 0, bottom: spacing.sm, borderRadius: radii.xl, borderWidth: 1 },
  previewLayerBack: { backgroundColor: colors.coralSoft, borderColor: colors.coralSoft, transform: [{ rotate: '-2deg' }] },
  previewLayerMid: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, transform: [{ rotate: '1.2deg' }] },
  previewCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.xs }, compactPreviewCard: { padding: spacing.xs }, compactCta: { minHeight: 48, paddingHorizontal: spacing.md },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, previewHeaderCopy: { flex: 1, gap: 2 }, featureDetail: { marginLeft: 2 },
  helpPreview: { gap: spacing.sm, marginTop: spacing.xs }, chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }, issueChip: { minHeight: 36, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.primarySoft }, statusCopy: { flex: 1, gap: 1 },
  comparePreview: { gap: spacing.sm, marginTop: spacing.xs }, metricRow: { flexDirection: 'row', gap: spacing.xs }, compactMetricRow: { flexDirection: 'row', gap: spacing.xs }, compactMetric: { flex: 1, padding: spacing.sm, gap: 2 }, compareBar: { gap: spacing.xs }, compareBarLabel: { gap: spacing.xxs, alignItems: 'flex-start' }, barTrack: { height: 12, borderRadius: 6, backgroundColor: colors.surfaceMuted, overflow: 'hidden', flexDirection: 'row' }, barStay: { flex: 1, backgroundColor: colors.primary }, barMove: { flex: 1, backgroundColor: colors.coral, marginLeft: 2 },
  callPreview: { gap: spacing.sm, paddingVertical: spacing.xs }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }, pagerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border }, dotActive: { width: 24, backgroundColor: colors.primary },
});
