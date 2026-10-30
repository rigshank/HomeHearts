import { DocumentKind, PlanTask, Program } from './types';

export function createPlanTasks(program: Program): PlanTask[] {
  const documentTasks: PlanTask[] = program.requiredDocuments.map((kind, index) => ({
    id: `doc-${kind}`, title: `Add ${documentLabel(kind)}`, detail: 'Keep a clear photo or PDF ready before you call.', dueLabel: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'This week', status: 'todo', source: 'document',
  }));
  return [...documentTasks,
    { id: 'call-provider', title: 'Call the provider', detail: 'Use your personalized script and ask about current availability.', dueLabel: 'After docs are ready', status: 'todo', source: 'call' },
    { id: 'follow-up', title: 'Save the next step', detail: 'Write down the person, date, and what happens next.', dueLabel: 'After your call', status: 'todo', source: 'follow_up' },
  ];
}

function documentLabel(kind: DocumentKind): string {
  return { photo_id: 'Photo ID', lease_or_rent_notice: 'lease or rent notice', income_proof: 'income proof', rent_increase_notice: 'rent increase notice' }[kind];
}

