import { Platform } from 'react-native';

export const colors = {
  canvas: '#F8F7FB', surface: '#FFFFFF', surfaceMuted: '#F3F0FA', surfaceStrong: '#EEE9FF',
  ink: '#211F2B', muted: '#746F80', mutedStrong: '#5F596D', border: '#E4DFEC',
  brand: '#1685E5', brandDark: '#0F64B6', brandSoft: '#E8F4FF', brandBorder: '#A9D7FA',
  primary: '#6C4EE3', primaryDark: '#5037B4', primarySoft: '#EEE9FF', coral: '#FF7766', coralSoft: '#FFF0ED',
  success: '#2B8C6B', successSoft: '#EAF7F1', warning: '#A8641A', warningSoft: '#FFF6E6',
  danger: '#B93835', dangerSoft: '#FDEDEC', white: '#FFFFFF', shadow: '#302550',
  harborDeep: '#281653', harborViolet: '#5B38C4', harborLavender: '#BCA2FF', harborWater: '#4630A7', harborGlow: '#FFE5B4',
};

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 };
export const radii = { sm: 10, md: 16, lg: 20, xl: 28, pill: 999 };
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const, letterSpacing: -0.4 },
  headline: { fontSize: 19, lineHeight: 25, fontWeight: '800' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: '800' as const, letterSpacing: 0.5 },
};

export const shadows = Platform.select({
  ios: {
    card: { shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
    floating: { shadowColor: colors.shadow, shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  },
  android: { card: { elevation: 2 }, floating: { elevation: 7 } }, default: {},
});
export const motion = { fast: 160, standard: 280, slow: 420 };

