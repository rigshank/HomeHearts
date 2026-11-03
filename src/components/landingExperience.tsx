import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { colors, shadows, spacing } from '../design/tokens';
import { HarborIllustration, HarborLogo } from './harborIllustration';
import { HomeDashboardContent } from './homeDashboard';
import { AmbientBackground, HText, TabBar } from './ui';
import { markLandingCompleted } from '../state/landingSession';
import type { LandingRoute } from './homeLandingModel';

export default function LandingExperience() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const progressState = useRef(0);
  const completionState = useRef(false);
  const [swipeChevron] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(swipeChevron, { toValue: 1, duration: 950, useNativeDriver: true }),
      Animated.timing(swipeChevron, { toValue: 0, duration: 950, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, swipeChevron]);

  const enterHome = () => {
    if (completionState.current) return;
    completionState.current = true;
    const animation = reduceMotion ? Animated.timing(progress, { toValue: 1, duration: 160, useNativeDriver: true }) : Animated.spring(progress, { toValue: 1, damping: 24, stiffness: 190, mass: 0.9, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished) {
        markLandingCompleted();
        router.replace('/(tabs)');
      } else {
        completionState.current = false;
      }
    });
  };

  const settle = (target: number) => {
    if (target === 1) {
      enterHome();
      return;
    }
    completionState.current = false;
    const animation = reduceMotion ? Animated.timing(progress, { toValue: 0, duration: 120, useNativeDriver: true }) : Animated.spring(progress, { toValue: 0, damping: 24, stiffness: 190, mass: 0.9, useNativeDriver: true });
    animation.start();
  };

  // PanResponder only reads these refs from native gesture callbacks after render.
  /* eslint-disable react-hooks/refs */
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy < -6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(0, Math.min(1, -gesture.dy / Math.max(280, height * 0.62)));
      progressState.current = next;
      progress.setValue(next);
    },
    onPanResponderRelease: (_, gesture) => {
      const shouldComplete = progressState.current > 0.38 || gesture.vy < -0.75;
      settle(shouldComplete ? 1 : 0);
    },
    onPanResponderTerminate: () => settle(0),
  });
  /* eslint-enable react-hooks/refs */

  const landingTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -110] });
  const landingScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.965] });
  const landingOpacity = progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 0.76, 0] });
  const sheetTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [height + 40, 0] });
  const sheetRadius = progress.interpolate({ inputRange: [0, 1], outputRange: [32, 0] });
  const promptOpacity = progress.interpolate({ inputRange: [0, 0.2], outputRange: [1, 0] });
  const chevronY = swipeChevron.interpolate({ inputRange: [0, 1], outputRange: [5, -5] });

  const navigateFromPreview = (route: LandingRoute) => {
    markLandingCompleted();
    router.replace('/(tabs)');
    setTimeout(() => router.push(route), 40);
  };

  return <View style={styles.root}>
    <StatusBar style="light" />
    <Animated.View {...panResponder.panHandlers} style={[styles.landingLayer, { opacity: landingOpacity, transform: [{ translateY: landingTranslate }, { scale: landingScale }] }]}>
      <HarborIllustration />
      <View style={[styles.landingCopy, { paddingTop: Math.max(insets.top + spacing.xl, 64) }]}>
        <HarborLogo size="large" light accessibilityLabel="HomeHearts harbor logo" />
        <HText variant="display" color={colors.white} style={styles.landingTitle}>HomeHearts</HText>
        <HText variant="micro" color="#F0E9FF" style={styles.landingEyebrow}>A CALMER WAY FORWARD</HText>
      </View>
      <Animated.View style={[styles.promptWrap, { bottom: Math.max(insets.bottom + spacing.xl, 34), opacity: promptOpacity, transform: [{ translateY: chevronY }] }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Enter HomeHearts home" onPress={enterHome} hitSlop={12} style={styles.promptButton}><Ionicons name="chevron-up" size={28} color={colors.white} /><HText variant="caption" color={colors.white}>Swipe up</HText></Pressable>
      </Animated.View>
    </Animated.View>
    <Animated.View pointerEvents="none" style={[styles.homeSheet, { transform: [{ translateY: sheetTranslate }], borderTopLeftRadius: sheetRadius, borderTopRightRadius: sheetRadius }]}>
      <AmbientBackground variant="home" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.previewContent, { paddingTop: Math.max(insets.top + spacing.md, spacing.xl), paddingBottom: 112 + insets.bottom }]}>
        <HomeDashboardContent onNavigate={navigateFromPreview} />
      </ScrollView>
      <TabBar />
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  landingLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' },
  landingCopy: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: spacing.sm },
  landingTitle: { letterSpacing: -1.1 },
  landingEyebrow: { letterSpacing: 2.1, marginTop: spacing.xs },
  promptWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  promptButton: { alignItems: 'center', gap: 2, minWidth: 100, minHeight: 54, justifyContent: 'center' },
  homeSheet: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', backgroundColor: colors.canvas, ...shadows.floating },
  previewContent: { paddingHorizontal: spacing.xl },
});
