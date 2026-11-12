import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors, radii, shadows, spacing } from '../design/tokens';
import { HText } from './ui';
import { getLandingActionLayout, getLandingOptionCopy, LANDING_FEATURES, LandingFeature, LandingRoute, getLandingRoute } from './homeLandingModel';

const HOME_SCREEN_ART = require('../homescreenicon.png');

export function HomeStartOptions({ hasPlan, onNavigate }: { hasPlan: boolean; onNavigate: (route: LandingRoute) => void }) {
  const { width } = useWindowDimensions();
  const narrow = getLandingActionLayout(width) === 'stacked';
  const [help, compare, call] = LANDING_FEATURES;
  return <View style={styles.options}>
    <StartOption feature={help} primary onPress={() => onNavigate(getLandingRoute(help.id, hasPlan))} />
    <View style={styles.toolsHeader}><HText variant="micro" color={colors.muted}>QUICK TOOLS</HText><View style={styles.toolsRule} /></View>
    <View style={[styles.secondaryGrid, narrow && styles.secondaryStack]}>
      <StartOption feature={compare} onPress={() => onNavigate(getLandingRoute(compare.id, hasPlan))} />
      <StartOption feature={call} hasPlan={hasPlan} onPress={() => onNavigate(getLandingRoute(call.id, hasPlan))} />
    </View>
  </View>;
}

function StartOption({ feature, primary = false, hasPlan = false, onPress }: { feature: LandingFeature; primary?: boolean; hasPlan?: boolean; onPress: () => void }) {
  const { title, detail } = getLandingOptionCopy(feature.id, hasPlan);
  const palette = primary
    ? { background: colors.primarySoft, border: colors.primary, icon: colors.primary, iconBackground: colors.white }
    : { background: colors.primarySoft, border: '#D9CCFF', icon: colors.primary, iconBackground: colors.white };

  if (primary) {
    return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} onPress={onPress} style={({ pressed }) => [styles.primaryPressable, pressed && styles.pressed]}>
      <View style={styles.primaryOption}>
        <Image accessible={false} source={HOME_SCREEN_ART} resizeMode="cover" style={styles.cardArt} />
        <View style={styles.primaryShade} />
        <View style={styles.optionTop}>
          <View style={styles.primaryIcon}><Ionicons accessible={false} aria-hidden name={feature.icon} size={23} color={colors.white} /></View>
          <View style={styles.primaryArrow}><Ionicons accessible={false} aria-hidden name="arrow-forward" size={19} color={colors.primary} /></View>
        </View>
        <HText variant="title" color={colors.white} numberOfLines={1} style={styles.primaryTitle}>{title}</HText>
        <HText variant="body" color="#F2EDFF" numberOfLines={1} style={styles.primaryDetail}>3 quick questions</HText>
      </View>
    </Pressable>;
  }

  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} onPress={onPress} style={({ pressed }) => [styles.option, styles.secondaryOption, { backgroundColor: palette.background, borderColor: palette.border }, pressed && styles.pressed]}>
    <View style={styles.secondaryWave} />
    <View style={styles.optionTop}>
      <View style={[styles.optionIcon, { backgroundColor: palette.iconBackground, borderColor: palette.border }]}><Ionicons accessible={false} aria-hidden name={feature.id === 'call' ? 'clipboard-outline' : feature.icon} size={20} color={palette.icon} /></View>
      <View style={[styles.optionArrow, { backgroundColor: palette.iconBackground }]}><Ionicons accessible={false} aria-hidden name="arrow-forward" size={16} color={palette.icon} /></View>
    </View>
    <HText variant="headline" numberOfLines={2}>{title}</HText>
  </Pressable>;
}

const styles = StyleSheet.create({
  options: { gap: spacing.sm },
  toolsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  toolsRule: { height: 1, flex: 1, backgroundColor: colors.border },
  secondaryGrid: { flexDirection: 'row', gap: spacing.sm },
  secondaryStack: { flexDirection: 'column' },
  primaryPressable: { borderRadius: radii.xl, ...shadows.floating },
  primaryOption: { minHeight: 208, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.xs, overflow: 'hidden', backgroundColor: colors.harborDeep },
  cardArt: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  primaryShade: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '66%', backgroundColor: 'rgba(40,22,83,0.26)' },
  primaryTitle: { maxWidth: '70%', marginTop: spacing.xs },
  primaryDetail: { maxWidth: '70%', marginTop: 2 },
  option: { position: 'relative', borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs, overflow: 'hidden', ...shadows.card },
  secondaryOption: { flex: 1, minHeight: 132 },
  secondaryWave: { position: 'absolute', width: '145%', height: 60, left: '-22%', bottom: -34, borderRadius: 999, backgroundColor: 'rgba(188,162,255,0.2)', transform: [{ rotate: '-5deg' }] },
  pressed: { opacity: 0.82 },
  optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  optionIcon: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  primaryIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)', alignItems: 'center', justifyContent: 'center' },
  optionArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
