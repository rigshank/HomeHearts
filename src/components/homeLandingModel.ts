export type LandingFeatureId = 'help' | 'compare' | 'call';
export type LandingRoute = '/intake' | '/compare' | '/plan';
export type LandingFeatureTone = 'purple' | 'coral' | 'success';
export type LandingFeatureIcon = 'sparkles-outline' | 'analytics-outline' | 'call-outline';

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
  { id: 'help', tone: 'purple', icon: 'sparkles-outline', eyebrow: 'FIND HELP', title: 'Start with what’s happening.', detail: 'A few questions, then local options.', cta: 'Start with 3 questions' },
  { id: 'compare', tone: 'coral', icon: 'analytics-outline', eyebrow: 'COMPARE PATHS', title: 'See the cost of staying or moving.', detail: 'Put the next few months side by side.', cta: 'Compare stay or move' },
  { id: 'call', tone: 'success', icon: 'call-outline', eyebrow: 'PREPARE TO CALL', title: 'Know what to ask next.', detail: 'Keep your plan, documents, and questions together.', cta: 'Prepare a call' },
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
