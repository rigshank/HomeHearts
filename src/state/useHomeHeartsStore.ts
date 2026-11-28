import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { migrateProgress, normalizeIntake, patchIntake } from '../domain/intake';
import { createPlanTasks, setTaskDate } from '../domain/planning';
import { ComparisonInput, DOCUMENT_LABELS, DocumentKind, DocumentRecord, IntakeProfile, PlanTask, Program } from '../domain/types';

type StoreState = {
  intake: IntakeProfile;
  comparison: ComparisonInput;
  selectedProgramId: string | null;
  savedPlanProgramId: string | null;
  documents: Partial<Record<DocumentKind, DocumentRecord>>;
  planTasks: PlanTask[];
  setIntake: (patch: Partial<IntakeProfile>) => void;
  setComparison: (patch: Partial<ComparisonInput>) => void;
  setSelectedProgram: (programId: string | null) => void;
  startPlan: (program: Program, expectedSavedId: string | null) => { ok: true } | { ok: false; error: string };
  upsertDocument: (record: DocumentRecord) => void;
  removeDocument: (kind: DocumentKind) => void;
  setPlanTasks: (programId: string, tasks: PlanTask[]) => void;
  toggleTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  rescheduleTask: (taskId: string, dueDate: string) => void;
  recordCalendarExport: (programId: string, taskId: string, date: string) => void;
  resetProgress: () => void;
};

const defaultIntake: IntakeProfile = { issue: null, issues: [], urgency: null, zipCode: '' };
const defaultComparison: ComparisonInput = { monthlyStayCents: 145000, monthlyStayAfterIncreaseCents: 160000, movingUpfrontCents: 320000, movingMonthlyCents: 135000, horizonMonths: 12 };

export const useHomeHeartsStore = create<StoreState>()(persist((set, get) => ({
  intake: defaultIntake,
  comparison: defaultComparison,
  selectedProgramId: null,
  savedPlanProgramId: null,
  documents: {},
  planTasks: [],
  setIntake: (patch) => set((state) => ({ intake: patchIntake(state.intake, patch) })),
  setComparison: (patch) => set((state) => ({ comparison: { ...state.comparison, ...patch } })),
  setSelectedProgram: (programId) => set({ selectedProgramId: programId }),
  startPlan: (program, expectedSavedId) => {
    const current = get();
    if (current.savedPlanProgramId === program?.id) return { ok: true };
    if (current.savedPlanProgramId !== expectedSavedId) return { ok: false, error: 'Your saved plan changed. Review the current plan before trying again.' };
    let tasks: PlanTask[];
    try {
      if (!program?.id || !Array.isArray(program.requiredDocuments) || program.requiredDocuments.some((kind) => !DOCUMENT_LABELS[kind])) throw new Error('Program details are incomplete.');
      // Build first. A failure cannot leave the provider ID and checklist out of sync.
      tasks = createPlanTasks(program);
      if (!tasks.length) throw new Error('No next steps could be created.');
    } catch {
      return { ok: false, error: 'This plan could not be started. Your previous checklist and documents have been kept. Retry or return to matches.' };
    }
    set({ savedPlanProgramId: program.id, planTasks: tasks });
    return { ok: true };
  },
  upsertDocument: (record) => set((state) => ({ documents: { ...state.documents, [record.kind]: record } })),
  removeDocument: (kind) => set((state) => { const next = { ...state.documents }; delete next[kind]; return { documents: next }; }),
  setPlanTasks: (programId, planTasks) => set((state) => state.savedPlanProgramId === programId ? { planTasks } : {}),
  toggleTask: (taskId) => set((state) => ({ planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task) })),
  skipTask: (taskId) => set((state) => ({ planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, status: 'skipped' } : task) })),
  rescheduleTask: (taskId, dueDate) => set((state) => ({ planTasks: setTaskDate(state.planTasks, taskId, dueDate) })),
  recordCalendarExport: (programId, taskId, date) => set((state) => state.savedPlanProgramId === programId
    ? { planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, calendarExportedDate: date } : task) } : {}),
  resetProgress: () => set({ intake: defaultIntake, comparison: defaultComparison, selectedProgramId: null, savedPlanProgramId: null, documents: {}, planTasks: [] }),
}), { name: 'homehearts-progress-v1', version: 1, migrate: migrateProgress, merge: (saved, current) => { const progress = saved as Partial<StoreState> | undefined; return { ...current, ...progress, intake: normalizeIntake(progress?.intake ?? current.intake) }; }, storage: createJSONStorage(() => AsyncStorage), partialize: (state) => ({ intake: state.intake, comparison: state.comparison, selectedProgramId: state.selectedProgramId, savedPlanProgramId: state.savedPlanProgramId, documents: Object.fromEntries(Object.entries(state.documents).map(([key, record]) => [key, record?.storageMode === 'supabase_private' ? record : { ...record, state: 'missing', localUri: undefined } ])), planTasks: state.planTasks }) }));

