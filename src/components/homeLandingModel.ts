export type LandingFeatureId = 'help' | 'compare' | 'call';
export type LandingRoute = '/intake' | '/compare' | '/plan';
export type LandingFeatureTone = 'purple' | 'coral' | 'success';
export type LandingFeatureIcon = 'heart-outline' | 'analytics-outline' | 'call-outline';

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
  { id: 'compare', tone: 'coral', icon: 'analytics-outline', eyebrow: 'COMPARE COSTS', title: 'Compare costs', detail: 'See staying and moving side by side.', cta: 'Compare costs' },
  { id: 'call', tone: 'success', icon: 'call-outline', eyebrow: 'GET READY', title: 'Get ready to call', detail: 'Keep your plan and questions together.', cta: 'Open my plan' },
];

export function getLandingFeature(index: number): LandingFeature {
  const normalizedIndex = ((index % LANDING_FEATURES.length) + LANDING_FEATURES.length) % LANDING_FEATURES.length;
  return LANDING_FEATURES[normalizedIndex];
}

export function getLandingRoute(featureId: LandingFeatureId, hasPlan: boolean): LandingRoute {
  if (featureId === 'help') return '/intake';
  if (featureId === 'compare') return '/compare';
  return hasPlan ? '/plan' : '/intake';
}
