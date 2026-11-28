import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS, NATIONAL_211 } from '../data/programs';
import { buildCallScript } from './callScript';
import { IntakeProfile } from './types';

const checked = new Date('2026-11-13T18:00:00Z');
const base: IntakeProfile = { issue: 'rent_increase', urgency: 'within_7_days', zipCode: '75201' };
const find = (id: string) => DALLAS_PROGRAMS.find((program) => program.id === id)!;

describe('buildCallScript', () => {
  it('names the program and provider and describes the situation, including the rent increase', () => {
    const { intro } = buildCallScript(find('dallas-county-welfare'), { ...base, rentIncreaseCents: 15000 }, checked);
    expect(intro).toContain('Dallas County Welfare Assistance with Dallas County Health and Human Services');
    expect(intro).toContain('facing a rent increase of $150 a month');
    expect(intro).toContain('near ZIP code 75201');
  });

  it('leaves out the amount for other issues and falls back gracefully without an issue or ZIP', () => {
    expect(buildCallScript(find('legal-aid-dallas-eviction'), { ...base, issue: 'eviction', rentIncreaseCents: 15000 }, checked).intro)
      .toContain('facing an eviction notice near');
    const bare = buildCallScript(find('legal-aid-dallas-eviction'), { issue: null, urgency: null, zipCode: '' }, checked).intro;
    expect(bare).toContain('looking for housing help');
    expect(bare).not.toContain('near ZIP');
    expect(bare).not.toContain('your housing concern');
  });

  it('asks about the documents this program actually lists', () => {
    const { questions } = buildCallScript(find('dallas-county-welfare'), base, checked);
    expect(questions.join(' ')).toContain('Photo ID, Lease or rent notice, and Income proof');
    const energy = buildCallScript(find('dallas-county-energy-assistance'), base, checked).questions.join(' ');
    expect(energy).toContain('Photo ID and Income proof');
    expect(energy).not.toContain('Lease');
    expect(buildCallScript(find('legal-aid-dallas-eviction'), base, checked).questions.join(' ')).toContain('What documents should I have ready?');
  });

  it('asks about the criteria the provider says still need confirming', () => {
    const { questions } = buildCallScript(find('dallas-county-welfare'), base, checked);
    expect(questions.join(' ')).toContain('based on income, documented disability, and other county requirements');
    const unknownCriteria = { ...find('dallas-county-welfare'), eligibilityToConfirm: undefined };
    expect(buildCallScript(unknownCriteria, base, checked).questions.join(' ')).toContain('eligibility requirements');
  });

  it('words referral services as finding the right provider, not applying', () => {
    const { intro, questions } = buildCallScript(find('texas-211'), base, checked);
    expect(intro).toContain('who I should contact next');
    expect(intro).not.toContain('whether I may qualify');
    expect(questions.join(' ')).not.toContain('eligibility requirements');
    expect(questions[questions.length - 1]).toBe('What should I do next, and who should I follow up with?');
    expect(questions.join(' ')).not.toContain('after I apply');
  });

  it('adapts the first question to the program’s intake status', () => {
    expect(buildCallScript(find('dallas-county-energy-assistance'), base, checked).questions[0]).toBe('Are you still accepting applications right now?');
    expect(buildCallScript(find('under-one-roof-rent'), base, checked).questions[0]).toContain('expected to reopen December 1, 2026');
    expect(buildCallScript(find('city-dallas-social-services'), base, checked).questions[0]).toContain('intake is closed');
    expect(buildCallScript(find('dha-housing-solutions'), base, checked).questions[0]).toContain('waitlist or lottery');
    expect(buildCallScript(find('texas-211'), base, checked).questions[0]).toContain('refer me');
    expect(buildCallScript(find('dallas-county-welfare'), base, checked).questions[0]).toContain('couldn’t confirm online');
  });

  it('stops promising a reopening once the announced date has passed', () => {
    const { questions } = buildCallScript(find('under-one-roof-rent'), base, new Date('2026-12-02T18:00:00Z'));
    expect(questions[0]).toContain('couldn’t confirm online');
    expect(questions[0]).not.toContain('expected to reopen');
  });

  it('mentions a published application deadline while the program is open', () => {
    const withDeadline = { ...find('dallas-county-energy-assistance'), deadline: { at: '2026-11-20T18:00:00Z', label: 'November 20 at noon CT' } };
    expect(buildCallScript(withDeadline, base, checked).questions[0]).toContain('November 20 at noon CT');
  });

  it('asks for a cutoff when none is published without claiming applications are always open', () => {
    const questions = buildCallScript(find('dallas-county-welfare'), base, checked).questions;
    expect(questions.join(' ')).toContain('I don’t have a published application deadline. Is there a cutoff date or an intake window');
  });

  it('asks about a new window after expiry instead of encouraging an application before a past date', () => {
    const program = { ...find('dallas-county-energy-assistance'),
      deadline: { at: '2026-11-10T18:00:00Z', label: 'November 10 at noon CT' } };
    const first = buildCallScript(program, base, checked).questions[0];
    expect(first).toContain('November 10 at noon CT, which has passed');
    expect(first).toContain('new window');
    expect(first).not.toContain('can I apply before then');
  });

  it('checks a published deadline even if intake is stale or waitlisted', () => {
    for (const status of ['call_to_verify', 'waitlist', 'closed'] as const) {
      const program = { ...find('dallas-county-energy-assistance'), status,
        deadline: { at: '2026-11-20T18:00:00Z', label: 'November 20 at noon CT' } };
      const text = buildCallScript(program, base, checked).questions.join(' ');
      expect(text).toContain('November 20 at noon CT. Does that date still apply');
    }
  });

  it('asks about the amount only when the provider does not publish one', () => {
    expect(buildCallScript(find('dallas-county-welfare'), base, checked).questions.join(' ')).toContain('doesn’t say how much help is available');
    expect(buildCallScript(find('texas-211'), base, checked).questions.join(' ')).not.toContain('how much help');
  });

  it('numbers the questions in the copied text', () => {
    const { questions, fullText } = buildCallScript(find('dallas-county-welfare'), base, checked);
    expect(fullText).toContain('Could you tell me: 1) ');
    expect(fullText).toContain(`${questions.length}) What happens after I apply`);
  });

  it('produces a complete script for every program in the catalog', () => {
    for (const program of [...DALLAS_PROGRAMS, NATIONAL_211]) {
      for (const issue of [base, { ...base, issue: null as IntakeProfile['issue'], zipCode: '' }]) {
        const script = buildCallScript(program, issue, checked);
        expect(script.questions.length, program.id).toBeGreaterThanOrEqual(3);
        expect(script.fullText, program.id).not.toMatch(/undefined|null|\[object/);
        expect(script.questions.every((question) => question.trim().endsWith('?')), program.id).toBe(true);
      }
    }
  });
});
