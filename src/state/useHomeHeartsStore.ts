import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ComparisonInput, DocumentKind, DocumentRecord, IntakeProfile, PlanTask } from '../domain/types';

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
  setSavedPlanProgram: (programId: string | null) => void;
  upsertDocument: (record: DocumentRecord) => void;
  removeDocument: (kind: DocumentKind) => void;
  setPlanTasks: (tasks: PlanTask[]) => void;
  toggleTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  rescheduleTask: (taskId: string) => void;
  resetProgress: () => void;
};

const defaultIntake: IntakeProfile = { issue: null, urgency: null, city: 'Dallas', zipCode: '' };
const defaultComparison: ComparisonInput = { monthlyStayCents: 145000, monthlyStayAfterIncreaseCents: 160000, movingUpfrontCents: 320000, movingMonthlyCents: 135000, horizonMonths: 12 };

export const useHomeHeartsStore = create<StoreState>()(persist((set) => ({
  intake: defaultIntake,
  comparison: defaultComparison,
  selectedProgramId: null,
  savedPlanProgramId: null,
  documents: {},
  planTasks: [],
  setIntake: (patch) => set((state) => ({ intake: { ...state.intake, ...patch } })),
  setComparison: (patch) => set((state) => ({ comparison: { ...state.comparison, ...patch } })),
  setSelectedProgram: (programId) => set({ selectedProgramId: programId }),
  setSavedPlanProgram: (savedPlanProgramId) => set({ savedPlanProgramId }),
  upsertDocument: (record) => set((state) => ({ documents: { ...state.documents, [record.kind]: record } })),
  removeDocument: (kind) => set((state) => { const next = { ...state.documents }; delete next[kind]; return { documents: next }; }),
  setPlanTasks: (planTasks) => set({ planTasks }),
  toggleTask: (taskId) => set((state) => ({ planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task) })),
  skipTask: (taskId) => set((state) => ({ planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, status: 'skipped' } : task) })),
  rescheduleTask: (taskId) => set((state) => ({ planTasks: state.planTasks.map((task) => task.id === taskId ? { ...task, dueLabel: task.dueLabel === 'Today' ? 'Tomorrow' : task.dueLabel === 'Tomorrow' ? 'This week' : 'Next week' } : task) })),
  resetProgress: () => set({ intake: defaultIntake, comparison: defaultComparison, selectedProgramId: null, savedPlanProgramId: null, documents: {}, planTasks: [] }),
}), { name: 'homehearts-progress-v1', storage: createJSONStorage(() => AsyncStorage), partialize: (state) => ({ intake: state.intake, comparison: state.comparison, selectedProgramId: state.selectedProgramId, savedPlanProgramId: state.savedPlanProgramId, documents: Object.fromEntries(Object.entries(state.documents).map(([key, record]) => [key, record?.storageMode === 'supabase_private' ? record : { ...record, state: 'missing', localUri: undefined } ])), planTasks: state.planTasks }) }));

