import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DALLAS_PROGRAMS } from '../data/programs';
import type { Program } from '../domain/types';

const storage = vi.hoisted(() => new Map<string, string>());
vi.mock('@react-native-async-storage/async-storage', () => ({ default: {
  getItem: async (key: string) => storage.get(key) ?? null,
  setItem: async (key: string, value: string) => { storage.set(key, value); },
  removeItem: async (key: string) => { storage.delete(key); },
} }));
import { useHomeHeartsStore } from './useHomeHeartsStore';

it('hydrates legacy storage, keeps other progress, and persists multiple concerns and cleared amounts', async () => {
  const saved = { intake: { issue: 'rent_increase', urgency: 'this_week', zipCode: '75201', rentIncreaseCents: 15000 },
    savedPlanProgramId: 'saved-provider', planTasks: [{ id: 'follow-up', status: 'done' }], comparison: { horizonMonths: 3 } };
  storage.set('homehearts-progress-v1', JSON.stringify({ version: 0, state: saved }));
  await useHomeHeartsStore.persist.rehydrate();
  expect(useHomeHeartsStore.getState()).toMatchObject({ ...saved, intake: { ...saved.intake, issues: ['rent_increase'], urgency: 'within_7_days' } });
  useHomeHeartsStore.getState().setIntake({ issues: ['eviction', 'utilities'], issue: 'utilities', urgency: 'within_3_days' });
  await useHomeHeartsStore.persist.rehydrate();
  expect(useHomeHeartsStore.getState().intake).toEqual({ issues: ['eviction', 'utilities'], issue: 'utilities', urgency: 'within_3_days', zipCode: '75201', rentIncreaseCents: undefined });
  expect(JSON.parse(storage.get('homehearts-progress-v1')!).version).toBe(1);
  expect(useHomeHeartsStore.getState().savedPlanProgramId).toBe('saved-provider');
  expect(useHomeHeartsStore.getState().planTasks).toEqual(saved.planTasks);
});

describe('atomic provider-plan switching', () => {
  const welfare = DALLAS_PROGRAMS.find((program) => program.id === 'dallas-county-welfare')!;
  const harmony = DALLAS_PROGRAMS.find((program) => program.id === 'harmony-eviction-prevention')!;
  beforeEach(() => useHomeHeartsStore.getState().resetProgress());

  it('publishes provider and tasks together, including a zero-document provider', () => {
    const observed: string[] = [];
    const unsubscribe = useHomeHeartsStore.subscribe((state) => {
      observed.push(state.savedPlanProgramId!);
      if (state.savedPlanProgramId === welfare.id) expect(state.planTasks.some((task) => task.source === 'document')).toBe(true);
      if (state.savedPlanProgramId === harmony.id) expect(state.planTasks.map((task) => task.source)).toEqual(['application', 'follow_up']);
    });
    expect(useHomeHeartsStore.getState().startPlan(welfare, null)).toEqual({ ok: true });
    expect(useHomeHeartsStore.getState().startPlan(harmony, welfare.id)).toEqual({ ok: true });
    unsubscribe();
    expect(observed).toEqual([welfare.id, harmony.id]);
  });

  it('does not reset completed tasks, dates or export history on repeated initialization', () => {
    const store = useHomeHeartsStore.getState();
    store.startPlan(welfare, null);
    const tasks = useHomeHeartsStore.getState().planTasks.map((task) => ({ ...task, status: 'done' as const, dueDate: '2026-12-10', calendarExportedDate: '2026-12-10' }));
    store.setPlanTasks(welfare.id, tasks);
    let notifications = 0;
    const unsubscribe = useHomeHeartsStore.subscribe(() => notifications++);
    for (let index = 0; index < 20; index++) expect(store.startPlan(welfare, welfare.id)).toEqual({ ok: true });
    unsubscribe();
    expect(notifications).toBe(0);
    expect(useHomeHeartsStore.getState().planTasks).toBe(tasks);
  });

  it('keeps the old plan and documents if initialization throws or the provider is invalid', () => {
    const store = useHomeHeartsStore.getState();
    store.startPlan(welfare, null);
    store.upsertDocument({ kind: 'photo_id', state: 'uploaded', name: 'demo.png', localUri: 'local-demo' });
    const before = useHomeHeartsStore.getState();
    const broken = { ...harmony, requiredDocuments: ['invalid'] } as unknown as Program;
    expect(store.startPlan(broken, welfare.id).ok).toBe(false);
    const throwsDuringBuild = { ...harmony, get nextStep(): string { throw new Error('Initialization failed'); } };
    expect(store.startPlan(throwsDuringBuild, welfare.id).ok).toBe(false);
    expect(store.startPlan(undefined as unknown as Program, welfare.id).ok).toBe(false);
    expect(useHomeHeartsStore.getState()).toBe(before);
  });

  it('rejects a stale replacement decision and a delayed task update from the previous provider', () => {
    const store = useHomeHeartsStore.getState();
    store.startPlan(welfare, null);
    const oldTasks = useHomeHeartsStore.getState().planTasks;
    store.startPlan(harmony, welfare.id);
    const nextTasks = useHomeHeartsStore.getState().planTasks;
    expect(store.startPlan(welfare, welfare.id).ok).toBe(false);
    store.setPlanTasks(welfare.id, oldTasks);
    expect(useHomeHeartsStore.getState().savedPlanProgramId).toBe(harmony.id);
    expect(useHomeHeartsStore.getState().planTasks).toBe(nextTasks);
  });

  it('preserves document references across explicit replacement and persists the new checklist', async () => {
    const store = useHomeHeartsStore.getState();
    store.startPlan(welfare, null);
    store.upsertDocument({ kind: 'photo_id', state: 'missing', name: 'demo.png' });
    const documents = useHomeHeartsStore.getState().documents;
    for (let index = 0; index < 3; index++) {
      expect(store.startPlan(harmony, useHomeHeartsStore.getState().savedPlanProgramId).ok).toBe(true);
      expect(store.startPlan(welfare, harmony.id).ok).toBe(true);
    }
    expect(useHomeHeartsStore.getState().documents).toBe(documents);
    const tasks = useHomeHeartsStore.getState().planTasks;
    await useHomeHeartsStore.persist.rehydrate();
    expect(useHomeHeartsStore.getState()).toMatchObject({ savedPlanProgramId: welfare.id, planTasks: JSON.parse(JSON.stringify(tasks)), documents });
  });
});
