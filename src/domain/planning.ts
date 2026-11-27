import { DocumentKind, PlanTask, Program } from './types';
import { dateForDueLabel, isTaskDate } from './planDates';

export function createPlanTasks(program: Program, now = new Date()): PlanTask[] {
  const documentTasks: PlanTask[] = program.requiredDocuments.map((kind, index) => ({
    id: `doc-${kind}`, title: `Add ${documentLabel(kind)}`, detail: 'Keep a clear photo or PDF ready before you call.', dueLabel: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'This week', status: 'todo', source: 'document',
  }));
  const tasks: PlanTask[] = [...documentTasks,
    { id: 'call-provider', title: program.phone ? 'Call the provider' : 'Check provider intake',
      detail: program.phone ? 'Use your personalized script and ask about current availability.' : program.nextStep,
      dueLabel: 'Today', status: 'todo', source: program.phone ? 'call' : 'application' },
    { id: 'follow-up', title: 'Save the next step', detail: 'Write down the person, date, and what happens next.', dueLabel: 'After your call', status: 'todo', source: 'follow_up' },
  ];
  return tasks.map((task) => ({ ...task, dueDate: dateForDueLabel(task.dueLabel, now) }));
}

export function updatePlanTasks(program: Program, savedTasks: PlanTask[], now = new Date()): PlanTask[] {
  return createPlanTasks(program, now).map((task) => {
    const saved = savedTasks.find((item) => item.id === task.id);
    return saved ? { ...task, status: saved.status, dueLabel: saved.dueLabel,
      dueDate: saved.dueDate && isTaskDate(saved.dueDate) ? saved.dueDate : dateForDueLabel(saved.dueLabel, now),
      calendarExportedDate: saved.calendarExportedDate } : task;
  });
}

export function setTaskDate(tasks: PlanTask[], taskId: string, dueDate: string): PlanTask[] {
  if (!isTaskDate(dueDate)) throw new Error('Enter a real date as YYYY-MM-DD.');
  return tasks.map((task) => task.id === taskId ? { ...task, dueDate, dueLabel: 'Scheduled' } : task);
}

export function markDocumentTaskDone(tasks: PlanTask[], kind: DocumentKind): PlanTask[] {
  return tasks.map((task) => task.id === `doc-${kind}` ? { ...task, status: 'done' } : task);
}

function documentLabel(kind: DocumentKind): string {
  return { photo_id: 'Photo ID', lease_or_rent_notice: 'lease or rent notice', income_proof: 'income proof', rent_increase_notice: 'rent increase notice' }[kind];
}

