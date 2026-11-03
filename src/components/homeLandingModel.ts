export type LandingFeatureId = 'help' | 'compare' | 'call';
export type LandingRoute = '/intake' | '/compare' | '/plan';
export type LandingFeatureTone = 'purple' | 'coral' | 'success';
export type LandingFeatureIcon = 'heart-outline' | 'analytics-outline' | 'call-outline';
export type LandingActionLayout = 'stacked' | 'split';

// Keep the compact dashboard grid on normal 375pt phones. Stack only on the
// narrowest devices where two cards would make the tap targets too cramped.
export const PHONE_ACTION_BREAKPOINT = 360;

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
  { id: 'help', tone: 'purple', icon: 'heart-outline', eyebrow: 'START HERE', title: 'Find help now', detail: 'Three questions. Dallas leads.', cta: 'Find help now' },
  { id: 'compare', tone: 'coral', icon: 'analytics-outline', eyebrow: 'COMPARE COSTS', title: 'Compare costs', detail: 'See stay vs. move.', cta: 'Compare costs' },
  { id: 'call', tone: 'success', icon: 'call-outline', eyebrow: 'GET READY', title: 'Get ready to call', detail: 'Keep your next step ready.', cta: 'Open my plan' },
];

export function getLandingOptionCopy(featureId: LandingFeatureId, hasPlan: boolean): Pick<LandingFeature, 'title' | 'detail'> {
  const feature = LANDING_FEATURES.find((item) => item.id === featureId);
  if (!feature) throw new Error(`Unknown landing feature: ${featureId}`);
  if (featureId === 'call') return { title: 'Open my plan', detail: hasPlan ? 'Pick up your next step.' : 'See your next steps.' };
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
  return '/plan';
}
