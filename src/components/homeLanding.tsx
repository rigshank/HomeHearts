import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors, radii, shadows, spacing } from '../design/tokens';
import { HText } from './ui';
import { LANDING_FEATURES, LandingFeature, LandingRoute, getLandingRoute } from './homeLandingModel';

export function HomeStartOptions({ hasPlan, onNavigate }: { hasPlan: boolean; onNavigate: (route: LandingRoute) => void }) {
  const { width } = useWindowDimensions();
  const narrow = width < 390;
  const [help, compare, call] = LANDING_FEATURES;
  return <View style={styles.options}>
    <StartOption feature={help} primary onPress={() => onNavigate(getLandingRoute(help.id, hasPlan))} />
    <HText variant="micro" color={colors.muted} style={styles.orLabel}>OR START WITH</HText>
    <View style={[styles.secondaryGrid, narrow && styles.secondaryStack]}>
      <StartOption feature={compare} onPress={() => onNavigate(getLandingRoute(compare.id, hasPlan))} />
      <StartOption feature={call} hasPlan={hasPlan} onPress={() => onNavigate(getLandingRoute(call.id, hasPlan))} />
    </View>
  </View>;
}

function StartOption({ feature, primary = false, hasPlan = false, onPress }: { feature: LandingFeature; primary?: boolean; hasPlan?: boolean; onPress: () => void }) {
  const isCallWithoutPlan = feature.id === 'call' && !hasPlan;
  const title = isCallWithoutPlan ? 'Start your plan' : feature.title;
  const detail = isCallWithoutPlan ? 'Answer a few questions first.' : feature.detail;
  const footer = primary ? 'NO ACCOUNT NEEDED' : feature.id === 'call' && hasPlan ? 'OPEN MY PLAN' : 'START WITH INTAKE';
  const palette = feature.id === 'help'
    ? { background: colors.brandSoft, border: colors.brandBorder, icon: colors.brand, iconBackground: colors.white, text: colors.ink, muted: colors.mutedStrong }
    : feature.id === 'compare'
      ? { background: colors.coralSoft, border: '#FFD0C9', icon: colors.coral, iconBackground: colors.white, text: colors.ink, muted: colors.mutedStrong }
      : { background: colors.successSoft, border: '#BCE5D4', icon: colors.success, iconBackground: colors.white, text: colors.ink, muted: colors.mutedStrong };
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} onPress={onPress} style={({ pressed }) => [styles.option, primary ? styles.primaryOption : styles.secondaryOption, { backgroundColor: palette.background, borderColor: palette.border }, pressed && styles.pressed]}>
    <View style={styles.optionTop}>
      <View style={[styles.optionIcon, { backgroundColor: palette.iconBackground, borderColor: palette.border }]}><Ionicons accessible={false} aria-hidden name={feature.icon} size={primary ? 23 : 19} color={palette.icon} /></View>
      <View style={[styles.optionArrow, { backgroundColor: palette.iconBackground }]}><Ionicons accessible={false} aria-hidden name="arrow-forward" size={16} color={palette.icon} /></View>
    </View>
    <HText variant={primary ? 'title' : 'headline'} style={{ color: palette.text }}>{title}</HText>
    <HText variant="caption" color={palette.muted} style={styles.optionDetail}>{detail}</HText>
    {primary && <View style={styles.optionFooter}><HText variant="micro" color={palette.icon}>{footer}</HText><Ionicons accessible={false} aria-hidden name="chevron-forward" size={14} color={palette.icon} /></View>}
  </Pressable>;
}

const styles = StyleSheet.create({
  options: { gap: spacing.sm },
  orLabel: { marginTop: spacing.xs },
  secondaryGrid: { flexDirection: 'row', gap: spacing.sm },
  secondaryStack: { flexDirection: 'column' },
  option: { borderWidth: 1, borderRadius: radii.xl, padding: spacing.md, gap: spacing.xs, ...shadows.card },
  primaryOption: { minHeight: 148 },
  secondaryOption: { flex: 1, minHeight: 112 },
  pressed: { opacity: 0.82 },
  optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  optionIcon: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  optionArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionDetail: { flex: 1 },
  optionFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
});
