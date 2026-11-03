import { describe, expect, it } from 'vitest';
import { getLandingActionLayout, getLandingFeature, getLandingOptionCopy, getLandingRoute, LANDING_FEATURES } from './homeLandingModel';

describe('HomeHearts landing feature model', () => {
  it('keeps the landing features in help, compare, call order', () => {
    expect(LANDING_FEATURES.map((feature) => feature.id)).toEqual(['help', 'compare', 'call']);
  });

  it('uses direct task language for the three starting points', () => {
    expect(LANDING_FEATURES.map((feature) => feature.title)).toEqual(['Find help now', 'Compare costs', 'Get ready to call']);
  });

  it('stacks landing actions through common phone widths', () => {
    expect(getLandingActionLayout(359)).toBe('stacked');
    expect(getLandingActionLayout(360)).toBe('stacked');
    expect(getLandingActionLayout(375)).toBe('split');
  });

  it('labels the call action according to saved-plan state', () => {
    expect(getLandingOptionCopy('call', false)).toEqual({ title: 'Open my plan', detail: 'See your next steps.' });
    expect(getLandingOptionCopy('call', true)).toEqual({ title: 'Open my plan', detail: 'Pick up your next step.' });
  });

  it('wraps previous and next feature indexes', () => {
    expect(getLandingFeature(-1).id).toBe('call');
    expect(getLandingFeature(3).id).toBe('help');
  });

  it('routes the features to their real HomeHearts flows', () => {
    expect(getLandingRoute('help', false)).toBe('/intake');
    expect(getLandingRoute('compare', false)).toBe('/compare');
    expect(getLandingRoute('call', false)).toBe('/plan');
    expect(getLandingRoute('call', true)).toBe('/plan');
  });
});
