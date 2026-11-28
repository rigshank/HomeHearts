import { describe, expect, it } from 'vitest';
import { getIntakeStep } from './intake';
import type { IntakeProfile } from '../domain/types';

const answers: IntakeProfile = { issue: 'rent_increase', urgency: 'within_7_days', zipCode: '75201' };

describe('intake step links', () => {
  it('reopens the requested question with saved answers, including older location links', () => {
    expect(getIntakeStep({ step: '0' }, answers)).toBe(0);
    expect(getIntakeStep({ step: '1' }, answers)).toBe(1);
    expect(getIntakeStep({ step: '2' }, answers)).toBe(2);
    expect(getIntakeStep({ location: '1' }, answers)).toBe(2);
    expect(getIntakeStep({ step: '0', location: '1' }, answers)).toBe(0);
  });

  it('starts at the first missing prerequisite rather than stranding a direct-link visitor', () => {
    expect(getIntakeStep({ step: '2' }, { ...answers, issue: null, urgency: null })).toBe(0);
    expect(getIntakeStep({ step: '2' }, { ...answers, urgency: null })).toBe(1);
    expect(getIntakeStep({ location: '1' }, { ...answers, issue: null })).toBe(0);
  });

  it('ignores malformed and repeated step values without exposing an out-of-bounds screen', () => {
    for (const step of ['-1', '3', 'NaN', '', ['1', '2']]) {
      expect(getIntakeStep({ step }, answers)).toBe(0);
    }
  });
});
