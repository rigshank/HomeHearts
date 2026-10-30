import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '../design/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

export function Screen({ children, scroll = true, contentStyle, refreshing }: PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle; refreshing?: ReactNode }>) {
  const insets = useSafeAreaInsets();
  if (!scroll) return <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>{children}</View>;
  return <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(spacing.md, insets.top), paddingBottom: 120 + insets.bottom }, contentStyle]} showsVerticalScrollIndicator={false}>{children}{refreshing}</ScrollView>;
}

export function HText({ children, variant = 'body', color = colors.ink, style, numberOfLines, accessibilityLabel }: PropsWithChildren<{ variant?: keyof typeof typography; color?: string; style?: any; numberOfLines?: number; accessibilityLabel?: string }>) {
  return <Text accessibilityLabel={accessibilityLabel} numberOfLines={numberOfLines} style={[typography[variant], { color }, style]}>{children}</Text>;
}

export function Card({ children, style, tone = 'default', onPress }: PropsWithChildren<{ style?: ViewStyle; tone?: 'default' | 'purple' | 'coral' | 'success'; onPress?: () => void }>) {
  const content = <View style={[styles.card, tone === 'purple' && styles.cardPurple, tone === 'coral' && styles.cardCoral, tone === 'success' && styles.cardSuccess, style]}>{children}</View>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>{content}</Pressable> : content;
}

export function Button({ children, onPress, variant = 'primary', icon, disabled = false, style, accessibilityLabel }: PropsWithChildren<{ onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: IconName; disabled?: boolean; style?: ViewStyle; accessibilityLabel?: string }>) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.buttonSecondary, variant === 'ghost' && styles.buttonGhost, variant === 'danger' && styles.buttonDanger, disabled && styles.buttonDisabled, pressed && styles.buttonPressed, style]}>
    {icon && <Ionicons name={icon} size={19} color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />}
    <HText variant="bodyStrong" color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}>{children}</HText>
  </Pressable>;
}

export function IconButton({ icon, onPress, label, color = colors.ink, background = colors.surface }: { icon: IconName; onPress: () => void; label: string; color?: string; background?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.iconButton, { backgroundColor: background }, pressed && styles.buttonPressed]}><Ionicons name={icon} size={21} color={color} /></Pressable>;
}

export function Pill({ children, tone = 'neutral', icon }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'coral' | 'purple'; icon?: IconName }>) {
  const palette = { neutral: [colors.surfaceMuted, colors.mutedStrong], success: [colors.successSoft, colors.success], warning: [colors.warningSoft, colors.warning], coral: [colors.coralSoft, colors.coral], purple: [colors.primarySoft, colors.primaryDark] }[tone];
  return <View style={[styles.pill, { backgroundColor: palette[0] }]}>{icon && <Ionicons name={icon} size={13} color={palette[1]} />}<HText variant="micro" color={palette[1]}>{children}</HText></View>;
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone = status === 'open' ? 'success' : status === 'waitlist' ? 'warning' : status === 'referral_required' ? 'purple' : status === 'closed' ? 'coral' : 'neutral';
  return <Pill tone={tone} icon={status === 'open' ? 'checkmark-circle' : status === 'waitlist' ? 'time-outline' : 'information-circle-outline'}>{label}</Pill>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <View style={styles.sectionHeading}>{<View style={styles.headingCopy}>{eyebrow && <HText variant="micro" color={colors.primary}>{eyebrow.toUpperCase()}</HText>}<HText variant="headline">{title}</HText></View>}{action}</View>;
}

export function OptionButton({ title, description, selected, onPress, icon }: { title: string; description?: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.buttonPressed]}>
    {icon && <View style={[styles.optionIcon, selected && styles.optionIconSelected]}><Ionicons name={icon} size={20} color={selected ? colors.primary : colors.mutedStrong} /></View>}
    <View style={styles.optionCopy}><HText variant="bodyStrong">{title}</HText>{description && <HText variant="caption" color={colors.muted} style={styles.optionDescription}>{description}</HText>}</View>
    <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
  </Pressable>;
}

export function IssueTile({ icon, title, selected, onPress, accessibilityLabel }: { icon: IconName; title: string; selected?: boolean; onPress: () => void; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="radio" accessibilityLabel={accessibilityLabel ?? title} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.issueTile, selected && styles.issueTileSelected, pressed && styles.buttonPressed]}>
    <View style={[styles.issueTileIcon, selected && styles.issueTileIconSelected]}><Ionicons name={icon} size={20} color={selected ? colors.primary : colors.mutedStrong} /></View>
    <HText variant="caption" numberOfLines={2} style={styles.issueTileTitle}>{title}</HText>
    <View style={[styles.issueTileRadio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
  </Pressable>;
}

export function Field({ label, helper, error, ...props }: TextInputProps & { label: string; helper?: string; error?: string }) {
  return <View style={styles.field}><HText variant="caption" color={colors.mutedStrong}>{label}</HText><TextInput placeholderTextColor={colors.muted} accessibilityLabel={label} style={[styles.input, error && styles.inputError]} {...props} />{error ? <HText variant="caption" color={colors.danger} style={styles.fieldMessage}>{error}</HText> : helper ? <HText variant="caption" color={colors.muted} style={styles.fieldMessage}>{helper}</HText> : null}</View>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const normalizedValue = Math.max(0, Math.min(1, value));
  return <View accessibilityLabel={label ?? `Progress ${Math.round(normalizedValue * 100)} percent`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 1, now: normalizedValue }}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${normalizedValue * 100}%` }]} /></View>{label && <HText variant="caption" color={colors.muted} style={styles.progressLabel}>{label}</HText>}</View>;
}

export function Reveal({ children, index = 0 }: PropsWithChildren<{ index?: number }>) {
  const reduceMotion = useReducedMotion();
  return <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(350).delay(index * 55)}>{children}</Animated.View>;
}

export function FloatingBack({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return <IconButton icon="chevron-back" label="Go back" onPress={onPress ?? (() => router.back())} />;
}

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const normalizedPath = pathname.replace('/(tabs)', '') || '/';
  const tabs: { path: '/(tabs)' | '/(tabs)/matches' | '/(tabs)/plan'; label: string; icon: IconName; activeIcon: IconName }[] = [
    { path: '/(tabs)', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { path: '/(tabs)/matches', label: 'Matches', icon: 'sparkles-outline', activeIcon: 'sparkles' },
    { path: '/(tabs)/plan', label: 'My plan', icon: 'checkbox-outline', activeIcon: 'checkbox' },
  ];
  return <View style={[styles.tabBar, { paddingBottom: Math.max(4, insets.bottom) }]}>{tabs.map((tab) => { const tabPath = tab.path === '/(tabs)' ? '/' : tab.path.replace('/(tabs)', ''); const active = normalizedPath === tabPath || (tabPath !== '/' && normalizedPath.startsWith(tabPath)); return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label} key={tab.path} onPress={() => router.replace(tab.path)} style={({ pressed }) => [styles.tabItem, pressed && styles.buttonPressed]}><Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? colors.primary : colors.muted} /><HText variant="micro" color={active ? colors.primary : colors.muted}>{tab.label}</HText></Pressable>; })}</View>;
}

export function useSpringPress() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { animatedStyle, pressIn: () => { scale.value = withSpring(0.97); }, pressOut: () => { scale.value = withSpring(1); } };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, scrollContent: { padding: spacing.xl, paddingBottom: 120 },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  cardPurple: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }, cardCoral: { backgroundColor: colors.coralSoft, borderColor: colors.coralSoft }, cardSuccess: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  pressed: { opacity: 0.86 }, button: { minHeight: 54, borderRadius: radii.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }, buttonGhost: { backgroundColor: 'transparent', minHeight: 44, paddingHorizontal: spacing.sm }, buttonDanger: { backgroundColor: colors.danger }, buttonDisabled: { opacity: 0.42 }, buttonPressed: { opacity: 0.78 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  pill: { minHeight: 28, borderRadius: radii.pill, paddingHorizontal: spacing.sm, gap: 5, alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-start' }, sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md }, headingCopy: { gap: spacing.xs, flex: 1 },
  option: { minHeight: 72, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }, optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, optionCopy: { flex: 1, gap: 3 }, optionDescription: { lineHeight: 18 }, optionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, optionIconSelected: { backgroundColor: colors.white }, issueTile: { minHeight: 92, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, gap: spacing.xs, justifyContent: 'space-between' }, issueTileSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, issueTileIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, issueTileIconSelected: { backgroundColor: colors.white }, issueTileTitle: { flex: 1, paddingRight: spacing.xs }, issueTileRadio: { position: 'absolute', right: spacing.sm, top: spacing.sm, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: colors.primary }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  field: { gap: spacing.xs, marginBottom: spacing.md }, input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 16 }, inputError: { borderColor: colors.danger }, fieldMessage: { marginTop: 1 }, progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary }, progressLabel: { marginTop: spacing.xs },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 68, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 6 }, tabItem: { minWidth: 80, minHeight: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', gap: 4 },
});

