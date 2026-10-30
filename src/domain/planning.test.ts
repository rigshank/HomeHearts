import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { createPlanTasks } from './planning';

describe('createPlanTasks', () => {
  it('creates document, call, and follow-up tasks without implying submission', () => {
    const tasks = createPlanTasks(DALLAS_PROGRAMS[0]);
    expect(tasks.map((task) => task.id)).toEqual(['doc-photo_id', 'doc-lease_or_rent_notice', 'doc-income_proof', 'doc-rent_increase_notice', 'call-provider', 'follow-up']);
    expect(tasks.every((task) => task.status === 'todo')).toBe(true);
    expect(tasks.find((task) => task.id === 'call-provider')?.detail).toContain('current availability');
    expect(tasks[0].dueLabel).toBe('Today');
  });
});

