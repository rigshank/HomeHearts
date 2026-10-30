import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { getMatchResults } from './matching';

describe('getMatchResults', () => {
  it('returns explainable Dallas matches for a rent increase', () => {
    const results = getMatchResults(DALLAS_PROGRAMS, { issue: 'rent_increase', urgency: 'this_week', city: 'Dallas', zipCode: '75201' });
    expect(results).toHaveLength(DALLAS_PROGRAMS.length);
    expect(results[0].score).toBeGreaterThan(50);
    expect(results[0].matchedReasons.length).toBeGreaterThan(0);
    expect(results[0].program.coverage.toLowerCase()).toContain('dallas');
  });

  it('keeps waitlist options visibly below active options', () => {
    const results = getMatchResults(DALLAS_PROGRAMS, { issue: 'rent_increase', urgency: 'planning', city: 'Dallas', zipCode: '75201' });
    const waitlist = results.find((result) => result.program.status === 'waitlist');
    expect(waitlist?.score).toBeLessThanOrEqual(48);
  });

  it('does not pretend a non-Dallas ZIP is a Dallas match', () => {
    const results = getMatchResults(DALLAS_PROGRAMS, { issue: 'rent_increase', urgency: 'planning', city: 'Dallas', zipCode: '98101' });
    expect(results.every((result) => result.score === 0)).toBe(true);
    expect(results[0].unknownReasons[0]).toContain('Dallas ZIP codes');
  });
});

