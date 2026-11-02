export type LandingFeatureId = 'help' | 'compare' | 'call';
export type LandingRoute = '/intake' | '/compare' | '/plan';
export type LandingFeatureTone = 'purple' | 'coral' | 'success';
export type LandingFeatureIcon = 'heart-outline' | 'analytics-outline' | 'call-outline';
export type LandingActionLayout = 'stacked' | 'split';

export const PHONE_ACTION_BREAKPOINT = 430;

export type LandingFeature = {
  id: LandingFeatureId;
  tone: LandingFeatureTone;
  icon: LandingFeatureIcon;
  eyebrow: string;
  title: string;
  detail: string;
  cta: string;
};

export const LANDING_FEATURES: readonly LandingFeature[] = [
  { id: 'help', tone: 'purple', icon: 'heart-outline', eyebrow: 'START HERE', title: 'Find help now', detail: 'Three questions to find Dallas options.', cta: 'Find help now' },
  { id: 'compare', tone: 'coral', icon: 'analytics-outline', eyebrow: 'COMPARE COSTS', title: 'Compare costs', detail: 'See stay and move side by side.', cta: 'Compare costs' },
  { id: 'call', tone: 'success', icon: 'call-outline', eyebrow: 'GET READY', title: 'Get ready to call', detail: 'Keep questions ready for a call.', cta: 'Open my plan' },
];

export function getLandingOptionCopy(featureId: LandingFeatureId, hasPlan: boolean): Pick<LandingFeature, 'title' | 'detail'> {
  const feature = LANDING_FEATURES.find((item) => item.id === featureId);
  if (!feature) throw new Error(`Unknown landing feature: ${featureId}`);
  if (featureId === 'call') return hasPlan ? { title: 'Open my plan', detail: 'Continue your saved next steps.' } : { title: 'Start your plan', detail: 'Answer a few questions first.' };
  return { title: feature.title, detail: feature.detail };
}

export function getLandingActionLayout(width: number): LandingActionLayout {
  return width <= PHONE_ACTION_BREAKPOINT ? 'stacked' : 'split';
}

export function getLandingFeature(index: number): LandingFeature {
  const normalizedIndex = ((index % LANDING_FEATURES.length) + LANDING_FEATURES.length) % LANDING_FEATURES.length;
  return LANDING_FEATURES[normalizedIndex];
}

export function getLandingRoute(featureId: LandingFeatureId, hasPlan: boolean): LandingRoute {
  if (featureId === 'help') return '/intake';
  if (featureId === 'compare') return '/compare';
  return hasPlan ? '/plan' : '/intake';
}
