import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { createPlanTasks, updatePlanTasks } from './planning';

describe('createPlanTasks', () => {
  it('creates document, call, and follow-up tasks without implying submission', () => {
    const tasks = createPlanTasks(DALLAS_PROGRAMS[0]);
    expect(tasks.map((task) => task.id)).toEqual(['doc-photo_id', 'doc-lease_or_rent_notice', 'doc-income_proof', 'call-provider', 'follow-up']);
    expect(tasks.every((task) => task.status === 'todo')).toBe(true);
    expect(tasks.find((task) => task.id === 'call-provider')?.detail).toContain('current availability');
    expect(tasks[0].dueLabel).toBe('Today');
  });

  it('keeps progress for checklist tasks still required by the provider', () => {
    const program = DALLAS_PROGRAMS[0];
    const oldTasks = createPlanTasks({ ...program, requiredDocuments: ['photo_id', 'rent_increase_notice'] });
    oldTasks[0] = { ...oldTasks[0], status: 'done', dueLabel: 'Next week' };
    const updated = updatePlanTasks(program, oldTasks);
    expect(updated[0]).toMatchObject({ id: 'doc-photo_id', status: 'done', dueLabel: 'Next week' });
    expect(updated.some((task) => task.id === 'doc-rent_increase_notice')).toBe(false);
    expect(updated.find((task) => task.id === 'doc-income_proof')?.status).toBe('todo');
  });
});

