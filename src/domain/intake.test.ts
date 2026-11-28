import { describe, expect, it } from 'vitest';
import { getConcerns, migrateProgress, normalizeIntake, patchIntake, toggleConcern } from './intake';
import { getLocationQuestions, getMatchResults } from './matching';
import { buildCallScript } from './callScript';
import { DALLAS_PROGRAMS } from '../data/programs';
import type { IntakeProfile, Program, Urgency } from './types';

const now = new Date('2026-11-13T18:00:00Z');
const profile: IntakeProfile = { issues: ['eviction', 'utilities'], issue: 'eviction', urgency: 'within_3_days', zipCode: '75201' };

describe('multiple concern intake and saved-data upgrade', () => {
  it.each([['this_week', 'within_7_days'], ['this_month', 'within_30_days'], ['today', 'today'], ['planning', 'planning']])('migrates legacy %s without losing usable data', (old, expected) => {
    const saved = { intake: { issue: 'rent_increase', urgency: old, zipCode: '75080', county: '48113', insideDallas: true, rentIncreaseCents: 15000 },
      selectedProgramId: 'saved', savedPlanProgramId: 'saved', documents: { photo_id: { state: 'missing' } }, planTasks: [{ id: 'call', status: 'done', dueDate: '2026-12-01' }], comparison: { horizonMonths: 3 } };
    expect(migrateProgress(saved)).toEqual({ ...saved, intake: { ...saved.intake, issues: ['rent_increase'], urgency: expected } });
  });

  it('retains the primary while toggling, chooses a remaining primary on removal, and clears obsolete amounts', () => {
    let intake = normalizeIntake({ ...profile, issues: ['eviction', 'utilities', 'rent_increase'], rentIncreaseCents: 15000 });
    intake = toggleConcern(intake, 'utilities');
    expect(intake.issue).toBe('eviction');
    expect(intake.rentIncreaseCents).toBe(15000);
    intake = toggleConcern(intake, 'rent_increase');
    expect(intake.rentIncreaseCents).toBeUndefined();
    intake = toggleConcern(intake, 'eviction');
    expect(intake).toMatchObject({ issue: null, issues: [] });
    intake = toggleConcern(intake, 'utilities');
    expect(intake.issue).toBe('utilities');
  });

  it('supports explicit primary selection and calculator entry without discarding other answers', () => {
    const next = patchIntake(profile, { issue: 'utilities' });
    expect(next.issues).toEqual(['eviction', 'utilities']);
    expect(next.issue).toBe('utilities');
    expect(patchIntake(next, { issue: 'rent_increase', rentIncreaseCents: 10000 })).toMatchObject({ issues: ['eviction', 'utilities', 'rent_increase'], issue: 'rent_increase', urgency: 'within_3_days', zipCode: '75201', rentIncreaseCents: 10000 });
  });

  it('sanitizes invalid and duplicate concerns and repairs a primary outside the selection', () => {
    expect(normalizeIntake({ issues: ['utilities', 'invalid', 'utilities'], issue: 'eviction', urgency: 'unknown' })).toMatchObject({ issues: ['utilities'], issue: 'utilities', urgency: null });
    expect(getConcerns({ issue: 'eviction' })).toEqual(['eviction']);
    expect(normalizeIntake(null)).toMatchObject({ issues: [], issue: null, urgency: null, zipCode: '' });
  });

  it('combines legal and utility resources, keeps IDs unique and explains both concerns', () => {
    const combined = getMatchResults([...DALLAS_PROGRAMS, ...DALLAS_PROGRAMS], profile, now);
    const matches = [...combined.actionable, ...combined.later];
    expect(matches.map(({ program }) => program.id)).toContain('legal-aid-dallas-eviction');
    expect(matches.map(({ program }) => program.id)).toContain('dallas-county-energy-assistance');
    expect(new Set(matches.map(({ program }) => program.id)).size).toBe(matches.length);
    const welfare = matches.find(({ program }) => program.id === 'dallas-county-welfare')!;
    expect(welfare.matchedReasons.join(' ')).toContain('an eviction notice');
    expect(welfare.matchedReasons.join(' ')).toContain('utility bills');
    expect(combined.actionable[0].program.id).toBe('legal-aid-dallas-eviction');
    expect(getMatchResults(DALLAS_PROGRAMS, { ...profile, issue: 'utilities' }, now).actionable[0].program.id).toBe('dallas-county-energy-assistance');
  });

  it('asks location follow-ups required by secondary concerns', () => {
    const border = { ...profile, issue: 'veteran' as const, issues: ['veteran', 'rent_increase'] as const, zipCode: '75080' };
    expect(getLocationQuestions(DALLAS_PROGRAMS, { ...border, issues: [...border.issues] })).toEqual({ counties: ['48085', '48113'], askDallasCity: true });
  });

  it.each(['today', 'within_3_days', 'within_7_days', 'within_30_days', 'planning'] as Urgency[])('uses the %s range consistently for long-term options', (urgency) => {
    const longTerm = { ...DALLAS_PROGRAMS.find((program) => program.id === 'dha-housing-solutions')!, status: 'open' as const };
    const result = getMatchResults([longTerm], { ...profile, issues: ['rent_increase'], issue: 'rent_increase', urgency }, now);
    const later = ['today', 'within_3_days', 'within_7_days'].includes(urgency);
    expect(result[later ? 'later' : 'actionable'].some(({ program }) => program.id === 'dha-housing-solutions')).toBe(true);
  });

  it('prioritizes immediate resources within three days but not the seven-day tier', () => {
    const base = DALLAS_PROGRAMS.find((program) => program.id === 'legal-aid-dallas-eviction')!;
    const candidates: Program[] = [{ ...base, id: 'regular', immediate: false }, { ...base, id: 'immediate', immediate: true }];
    expect(getMatchResults(candidates, profile, now).actionable[0].program.id).toBe('immediate');
    expect(getMatchResults(candidates, { ...profile, urgency: 'within_7_days' }, now).actionable[0].program.id).toBe('regular');
  });

  it('includes all concerns, the chosen primary, timeframe and only relevant rent amounts in scripts', () => {
    const program = DALLAS_PROGRAMS[0];
    const intro = buildCallScript(program, { ...profile, issues: ['eviction', 'rent_increase', 'utilities'], rentIncreaseCents: 15000 }, now).intro;
    expect(intro).toContain('an eviction notice, a rent increase of $150 a month, and utility bills');
    expect(intro).toContain('My primary concern is an eviction notice.');
    expect(intro).toContain('Within 3 days');
    expect(buildCallScript(program, { ...profile, rentIncreaseCents: 15000 }, now).intro).not.toContain('$150');
  });
});
