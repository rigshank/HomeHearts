import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View, ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { colors, shadows } from '../design/tokens';

type HarborLogoProps = { size?: 'small' | 'medium' | 'large'; light?: boolean; accessibilityLabel?: string };
const HOMEHEARTS_LOGO = require('../logo.png');

export function HarborLogo({ size = 'medium', light = false, accessibilityLabel = 'HomeHearts logo' }: HarborLogoProps) {
  const dimension = size === 'small' ? 44 : size === 'medium' ? 64 : 82;
  return <View accessible accessibilityLabel={accessibilityLabel} style={[styles.logo, { width: dimension, height: dimension, borderRadius: dimension * 0.3, backgroundColor: light ? '#E8DFFF' : colors.primarySoft, borderColor: light ? 'rgba(255,255,255,0.35)' : '#DCCFFF' }]}><Image accessible={false} source={HOMEHEARTS_LOGO} resizeMode="cover" style={styles.logoImage} /></View>;
}

export function HarborIllustration({ compact = false, animated = true, style }: { compact?: boolean; animated?: boolean; style?: ViewStyle }) {
  const reduceMotion = useReducedMotion();
  const [farWave] = useState(() => new Animated.Value(0));
  const [nearWave] = useState(() => new Animated.Value(0));
  const shouldAnimate = animated && !reduceMotion;

  useEffect(() => {
    if (!shouldAnimate) return;
    const farWaveLoop = Animated.loop(Animated.sequence([
      Animated.timing(farWave, { toValue: 1, duration: 8200, useNativeDriver: true }),
      Animated.timing(farWave, { toValue: 0, duration: 8200, useNativeDriver: true }),
    ]));
    const nearWaveLoop = Animated.loop(Animated.sequence([
      Animated.timing(nearWave, { toValue: 1, duration: 5400, useNativeDriver: true }),
      Animated.timing(nearWave, { toValue: 0, duration: 5400, useNativeDriver: true }),
    ]));
    farWaveLoop.start();
    nearWaveLoop.start();
    return () => {
      farWaveLoop.stop();
      nearWaveLoop.stop();
    };
  }, [farWave, nearWave, shouldAnimate]);

  const farWaveX = farWave.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] });
  const nearWaveX = nearWave.interpolate({ inputRange: [0, 1], outputRange: [16, -16] });

  return <View pointerEvents="none" style={[styles.illustration, compact && styles.illustrationCompact, style]}>
    <LinearGradient colors={[colors.harborDeep, colors.harborViolet, compact ? colors.primary : '#8763E8']} locations={[0, 0.58, 1]} style={styles.fill} />
    <View style={styles.atmosphereGlow} />
    <View style={styles.distantHill} />
    <View style={styles.middleHill} />
    <View style={styles.water} />
    <Animated.View style={[styles.wave, styles.waveFar, { transform: [{ translateX: farWaveX }] }]} />
    <Animated.View style={[styles.wave, styles.waveNear, { transform: [{ translateX: nearWaveX }] }]} />
    <Particle animated={shouldAnimate} position={{ left: '18%', top: '24%' }} delay={0} />
    <Particle animated={shouldAnimate} position={{ left: '34%', top: '17%' }} delay={700} />
    <Particle animated={shouldAnimate} position={{ left: '69%', top: '21%' }} delay={1300} />
    <Particle animated={shouldAnimate} position={{ left: '78%', top: '36%' }} delay={1900} />
  </View>;
}

function Particle({ animated, position, delay }: { animated: boolean; position: ViewStyle; delay: number }) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [animated, delay, value]);
  const opacity = value.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.8] });
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [5, -7] });
  return <Animated.View style={[styles.particle, position, { opacity, transform: [{ translateY }] }]} />;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  logo: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, overflow: 'hidden', ...shadows.card },
  logoImage: { width: '100%', height: '100%' },
  illustration: { flex: 1, overflow: 'hidden', backgroundColor: colors.harborDeep },
  illustrationCompact: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  atmosphereGlow: { position: 'absolute', width: '82%', height: '46%', top: '8%', right: '-18%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)' },
  distantHill: { position: 'absolute', width: '135%', height: '32%', left: '-20%', bottom: '34%', borderRadius: 999, backgroundColor: 'rgba(188,162,255,0.36)', transform: [{ rotate: '-5deg' }] },
  middleHill: { position: 'absolute', width: '150%', height: '30%', left: '-32%', bottom: '21%', borderRadius: 999, backgroundColor: 'rgba(54,32,133,0.48)', transform: [{ rotate: '4deg' }] },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%', backgroundColor: 'rgba(38,24,110,0.54)' },
  wave: { position: 'absolute', width: '165%', height: 42, left: '-30%', borderTopWidth: 2, borderRadius: 999 },
  waveFar: { bottom: '26%', borderColor: 'rgba(255,229,180,0.34)' },
  waveNear: { bottom: '12%', borderColor: 'rgba(188,162,255,0.54)' },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.harborGlow },
});
