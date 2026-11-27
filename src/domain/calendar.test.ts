import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { createTaskCalendar } from './calendar';
import { dateForDueLabel, formatTaskDate, isTaskDate, localTaskDate } from './planDates';
import { createPlanTasks } from './planning';

const program = DALLAS_PROGRAMS[0];
const now = new Date('2026-11-27T18:00:00Z');
const task = createPlanTasks(program, now)[0];
const unfold = (contents: string) => contents.replace(/\r\n /g, '');

describe('calendar export', () => {
  it('exports only the selected task, provider and next step, with local 9 a.m. timing', () => {
    const { contents, filename } = createTaskCalendar(program, task, '2026-12-08', false, now);
    const text = unfold(contents);
    expect(text).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
    expect(text).toContain('DTSTART:20261208T090000\r\nDURATION:PT15M');
    expect(text).toContain('DTSTAMP:20261127T180000Z');
    expect(text).toContain(`SUMMARY:HomeHearts: ${task.title}`);
    expect(text).toContain(`Provider: ${program.name}`);
    expect(text).toContain(`Next step: ${task.detail}`);
    expect(text).toContain('not a provider appointment or application deadline');
    expect(text).toContain('CLASS:PRIVATE');
    expect(text).not.toContain('BEGIN:VALARM');
    expect(text).not.toMatch(/ATTACH|ATTENDEE|ORGANIZER/);
    expect(filename).toMatch(/^homehearts-[a-z0-9_-]+\.ics$/);
    expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it('includes an alert only when explicitly selected and rejects alerts in the past', () => {
    expect(createTaskCalendar(program, task, '2026-12-08', true, now).contents)
      .toContain('BEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY');
    expect(() => createTaskCalendar(program, task, '2026-11-26', true, now)).toThrow('has passed');
  });

  it('uses the changed date with a stable event identity and never exports done/skipped tasks', () => {
    const first = unfold(createTaskCalendar(program, task, '2026-12-08', false, now).contents);
    const second = unfold(createTaskCalendar(program, task, '2026-12-10', false, now).contents);
    expect(first.match(/UID:.*/)?.[0]).toBe(second.match(/UID:.*/)?.[0]);
    expect(second).toContain('DTSTART:20261210T090000');
    expect(second).not.toContain('20261208');
    for (const status of ['done', 'skipped'] as const) {
      expect(() => createTaskCalendar(program, { ...task, status }, '2026-12-08')).toThrow('incomplete');
    }
  });

  it('escapes calendar text injection and folds Unicode content within 75 UTF-8 bytes', () => {
    const title = 'Photo ID, lease; \\ test\r\nATTENDEE:someone@example.test';
    const { contents } = createTaskCalendar({ ...program, name: '住房🏠'.repeat(60) }, { ...task, title }, '2026-12-08', false, now);
    expect(unfold(contents)).toContain('Photo ID\\, lease\\; \\\\ test\\nATTENDEE:');
    expect(contents).not.toContain('\r\nATTENDEE:');
    for (const line of contents.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(unfold(contents)).toContain('住房🏠'.repeat(60));
    expect(contents.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});

describe('local task dates', () => {
  it('validates leap days and rejects rolled-over or ambiguous dates', () => {
    expect(isTaskDate('2028-02-29')).toBe(true);
    for (const date of ['2026-02-29', '2026-02-30', '12/08/2026', '2026-13-01', '2026-00-01', '2026-12-00']) {
      expect(isTaskDate(date), date).toBe(false);
      expect(() => createTaskCalendar(program, task, date)).toThrow('real date');
    }
  });

  it('preserves calendar dates across a month/year boundary and daylight saving changes', () => {
    expect(localTaskDate(new Date(2026, 11, 31, 23), 1)).toBe('2027-01-01');
    expect(localTaskDate(new Date(2026, 9, 31, 23), 2)).toBe('2026-11-02');
    expect(dateForDueLabel('After your call')).toBeUndefined();
    expect(formatTaskDate('2026-12-08')).toBe('Dec 8, 2026');
  });
});
