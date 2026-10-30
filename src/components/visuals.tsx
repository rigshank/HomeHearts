import { Ionicons } from '@expo/vector-icons';
import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../design/tokens';
import { HText } from './ui';

type IconName = keyof typeof Ionicons.glyphMap;
type VisualTone = 'purple' | 'coral' | 'success' | 'neutral';

const toneMap: Record<VisualTone, { icon: string; wash: string; line: string }> = {
  purple: { icon: colors.primary, wash: colors.primarySoft, line: colors.primary },
  coral: { icon: colors.coral, wash: colors.coralSoft, line: colors.coral },
  success: { icon: colors.success, wash: colors.successSoft, line: colors.success },
  neutral: { icon: colors.mutedStrong, wash: colors.surfaceMuted, line: colors.mutedStrong },
};

export function VisualMark({ icon, tone = 'purple', size = 'large', label }: { icon: IconName; tone?: VisualTone; size?: 'small' | 'medium' | 'large'; label?: string }) {
  const dimension = size === 'small' ? 44 : size === 'medium' ? 56 : 72;
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 26 : 32;
  const palette = toneMap[tone];
  return <View accessible={Boolean(label)} accessibilityLabel={label} style={[styles.mark, { width: dimension, height: dimension, borderRadius: dimension * 0.28, backgroundColor: palette.wash, borderColor: palette.line }]}><Ionicons name={icon} size={iconSize} color={palette.icon} /></View>;
}

export function MetricTile({ icon, label, value, tone = 'purple' }: { icon: IconName; label: string; value: string; tone?: VisualTone }) {
  const palette = toneMap[tone];
  return <View style={[styles.metricTile, { borderTopColor: palette.line }]}><Ionicons name={icon} size={16} color={palette.icon} /><HText variant="micro" color={colors.muted}>{label}</HText><HText variant="bodyStrong" numberOfLines={2}>{value}</HText></View>;
}

export function IconRow({ icon, title, detail, tone = 'purple' }: { icon: IconName; title: string; detail?: string; tone?: VisualTone }) {
  const palette = toneMap[tone];
  return <View style={styles.iconRow}><View style={[styles.rowIcon, { backgroundColor: palette.wash }]}><Ionicons name={icon} size={18} color={tone === 'neutral' ? colors.mutedStrong : tone === 'coral' ? colors.coral : tone === 'success' ? colors.success : colors.primary} /></View><View style={styles.rowCopy}><HText variant="bodyStrong" numberOfLines={1}>{title}</HText>{detail && <HText variant="caption" color={colors.muted} numberOfLines={1}>{detail}</HText>}</View></View>;
}

export function StepRail({ steps }: { steps: { icon: IconName; label: string }[] }) {
  return <View style={styles.stepRail}>{steps.map((step, index) => <React.Fragment key={step.label}><View style={styles.stepItem}><View style={styles.stepIcon}><Ionicons name={step.icon} size={17} color={colors.primary} /></View><HText variant="micro" color={colors.mutedStrong} style={styles.stepLabel}>{step.label}</HText></View>{index < steps.length - 1 && <View style={styles.stepLine} />}</React.Fragment>)}</View>;
}

export function CompactSurface({ children, tone = 'neutral', style }: PropsWithChildren<{ tone?: VisualTone; style?: object }>) {
  const palette = toneMap[tone];
  return <View style={[styles.compactSurface, { backgroundColor: palette.wash }, style]}>{children}</View>;
}

export function VisualAction({ icon, title, detail, tone = 'purple', onPress }: { icon: IconName; title: string; detail: string; tone?: VisualTone; onPress: () => void }) {
  const palette = toneMap[tone];
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.visualAction, pressed && styles.pressed]}><View style={styles.actionHeader}><View style={[styles.actionIcon, { backgroundColor: palette.wash, borderColor: palette.line }]}><Ionicons name={icon} size={18} color={palette.icon} /></View><Ionicons name="arrow-forward" size={17} color={palette.icon} /></View><HText variant="bodyStrong" numberOfLines={2}>{title}</HText><HText variant="micro" color={colors.muted}>{detail}</HText></Pressable>;
}

const styles = StyleSheet.create({
  mark: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, metricTile: { flex: 1, minHeight: 86, borderRadius: radii.md, padding: spacing.sm, gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderTopWidth: 3, borderColor: colors.border }, iconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, rowIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1, gap: 2 }, stepRail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }, stepItem: { alignItems: 'center', gap: 6, flex: 1 }, stepIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, stepLabel: { textAlign: 'center' }, stepLine: { height: 1, flex: 0.45, backgroundColor: colors.border, marginBottom: 21 }, compactSurface: { borderRadius: radii.md, padding: spacing.md }, visualAction: { flex: 1, minHeight: 124, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }, actionIcon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.78 },
});
