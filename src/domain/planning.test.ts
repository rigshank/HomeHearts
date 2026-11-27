import { describe, expect, it } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import { createPlanTasks, markDocumentTaskDone, setTaskDate, updatePlanTasks } from './planning';

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

describe('task dates', () => {
  const now = new Date(2026, 10, 27, 12);

  it('anchors suggested dates once, preserving saved dates and export history across refreshes', () => {
    const program = DALLAS_PROGRAMS[0];
    const tasks = createPlanTasks(program, now);
    expect(tasks[0].dueDate).toBe('2026-11-27');
    expect(tasks[1].dueDate).toBe('2026-11-28');
    expect(tasks[2].dueDate).toBe('2026-11-30');
    expect(tasks.find((task) => task.id === 'follow-up')?.dueDate).toBeUndefined();
    tasks[0].calendarExportedDate = '2026-11-27';
    const refreshed = updatePlanTasks(program, tasks, new Date(2026, 11, 5));
    expect(refreshed[0]).toMatchObject({ dueDate: '2026-11-27', calendarExportedDate: '2026-11-27' });
  });

  it('migrates undated legacy tasks while leaving after-call follow-ups for the user to date', () => {
    const program = DALLAS_PROGRAMS[0];
    const legacy = createPlanTasks(program).map(({ dueDate, ...task }) => task);
    legacy[0].dueLabel = 'Next week';
    const migrated = updatePlanTasks(program, legacy, now);
    expect(migrated[0].dueDate).toBe('2026-12-04');
    expect(migrated.find((task) => task.id === 'follow-up')?.dueDate).toBeUndefined();
    expect(updatePlanTasks(program, migrated, new Date(2026, 11, 9))).toEqual(migrated);
  });

  it('reschedules only the selected task and retains the old calendar date for change guidance', () => {
    const tasks = createPlanTasks(DALLAS_PROGRAMS[0], now);
    tasks[0].calendarExportedDate = '2026-11-27';
    const updated = setTaskDate(tasks, tasks[0].id, '2026-12-08');
    expect(updated[0]).toMatchObject({ dueDate: '2026-12-08', calendarExportedDate: '2026-11-27' });
    expect(updated.slice(1)).toEqual(tasks.slice(1));
    expect(() => setTaskDate(tasks, tasks[0].id, '2026-02-30')).toThrow('real date');
  });
});

describe('markDocumentTaskDone', () => {
  it('completes only the task for the uploaded document', () => {
    const tasks = markDocumentTaskDone(createPlanTasks(DALLAS_PROGRAMS[0]), 'photo_id');
    expect(tasks.find((task) => task.id === 'doc-photo_id')?.status).toBe('done');
    expect(tasks.filter((task) => task.status === 'done')).toHaveLength(1);
  });
});

