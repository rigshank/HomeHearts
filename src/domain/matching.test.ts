import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { getLocationQuestions, getMatchResults, getProgramAvailability } from './matching';
import { IntakeProfile } from './types';

const checked = new Date('2026-11-13T18:00:00Z');
const dallas: IntakeProfile = { issue: 'rent_increase', urgency: 'this_week', zipCode: '75201' };
const find = (id: string) => DALLAS_PROGRAMS.find((program) => program.id === id)!;

describe('getMatchResults', () => {
  it('separates Dallas rent leads and explains facts and criteria to confirm', () => {
    const { actionable, later } = getMatchResults(DALLAS_PROGRAMS, dallas, checked);
    expect(actionable[0].program.id).toBe('dallas-county-welfare');
    expect(actionable[0].matchedReasons).toEqual(['Helps with rent payments', 'Dallas County']);
    expect(actionable[0].unknownReasons[0]).toContain('documented disability');
    expect(later.map(({ program }) => program.id)).toContain('under-one-roof-rent');
    expect(later.map(({ program }) => program.id)).toContain('dha-housing-solutions');
    expect(actionable.every(({ program }) => !program.serviceTypes.includes('utilities') || program.serviceTypes.includes('rent'))).toBe(true);
  });

  it('ranks legal intake first for urgent eviction and routes shelter requests to the crisis line', () => {
    const eviction = getMatchResults(DALLAS_PROGRAMS, { ...dallas, issue: 'eviction', urgency: 'today' }, checked);
    expect(eviction.actionable[0].program.id).toBe('legal-aid-dallas-eviction');
    const shelter = getMatchResults(DALLAS_PROGRAMS, { ...dallas, issue: 'shelter', urgency: 'today' }, checked);
    expect(shelter.actionable[0].program.id).toBe('housing-forward-crisis-line');
    expect(shelter.later).toHaveLength(0);
  });

  it('uses the appropriate 211 directory outside local coverage', () => {
    for (const [zipCode, referralId] of [['75701', 'texas-211'], ['79901', 'texas-211'], ['98101', 'national-211']]) {
      const result = getMatchResults(DALLAS_PROGRAMS, { ...dallas, zipCode }, checked);
      expect(result.actionable).toHaveLength(0);
      expect(result.later).toHaveLength(0);
      expect(result.referral?.id).toBe(referralId);
    }
    expect(getMatchResults(DALLAS_PROGRAMS, { ...dallas, zipCode: '75ABC' }, checked).referral).toBeUndefined();
  });

  it('asks for relevant boundaries and preserves services that cover both counties', () => {
    const border = { ...dallas, zipCode: '75080' };
    expect(getLocationQuestions(DALLAS_PROGRAMS, border)).toEqual({ counties: ['48085', '48113'], askDallasCity: true });
    const unresolved = getMatchResults(DALLAS_PROGRAMS, border, checked);
    expect(unresolved.actionable.map(({ program }) => program.id)).not.toContain('dallas-county-welfare');
    expect(unresolved.later.map(({ program }) => program.id)).not.toContain('city-dallas-social-services');
    expect(unresolved.later.map(({ program }) => program.id)).toContain('under-one-roof-rent');

    const confirmed = getMatchResults(DALLAS_PROGRAMS, { ...border, county: '48113', insideDallas: true }, checked);
    expect(confirmed.actionable.map(({ program }) => program.id)).toContain('dallas-county-welfare');
    expect(confirmed.later.map(({ program }) => program.id)).toContain('city-dallas-social-services');
    expect(getLocationQuestions(DALLAS_PROGRAMS, { ...border, issue: 'veteran' })).toEqual({ counties: [], askDallasCity: false });
  });

  it('offers specialist referrals by need', () => {
    for (const [issue, programId] of [
      ['moving', 'texas-211-deposit-referrals'],
      ['disability', 'tdhca-accessible-housing'],
      ['youth', 'housing-forward-youth'],
      ['domestic_violence', 'national-domestic-violence-hotline'],
      ['veteran', 'va-homeless-veterans'],
    ] as const) {
      const { actionable } = getMatchResults(DALLAS_PROGRAMS, { ...dallas, issue }, checked);
      expect(actionable[0].program.id).toBe(programId);
    }
  });
});

describe('getProgramAvailability', () => {
  it('shows an announced reopening and verifies again once the date arrives', () => {
    const program = find('under-one-roof-rent');
    expect(getProgramAvailability(program, checked)).toMatchObject({ status: 'closed', timing: expect.stringContaining('December 1') });
    expect(getProgramAvailability(program, new Date('2026-12-01T15:00:00Z'))).toMatchObject({
      status: 'call_to_verify', timing: expect.stringContaining('has passed'),
    });
  });

  it('expires open claims and honors a published application deadline', () => {
    const program = find('dallas-county-energy-assistance');
    expect(getProgramAvailability(program, checked).status).toBe('open');
    expect(getProgramAvailability(program, new Date('2026-11-21T18:00:00Z')).status).toBe('call_to_verify');
    const withDeadline = { ...program, deadline: { at: '2026-11-14T18:00:00Z', label: 'November 14 at noon CT' } };
    expect(getProgramAvailability(withDeadline, checked).timing).toBe('Apply by November 14 at noon CT');
    expect(getProgramAvailability(withDeadline, new Date(withDeadline.deadline.at)).status).toBe('closed');
  });
});
