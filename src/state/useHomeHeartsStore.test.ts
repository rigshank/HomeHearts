import { expect, it, vi } from 'vitest';

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
