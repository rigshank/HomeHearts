import type { IntakeProfile, IssueType, Urgency } from './types';

export const ISSUE_TYPES: IssueType[] = ['rent_increase', 'eviction', 'utilities', 'homeless', 'shelter', 'moving', 'legal', 'domestic_violence', 'disability', 'veteran', 'youth', 'general'];
export const URGENCY_OPTIONS: { value: Urgency; title: string; description: string }[] = [
  { value: 'today', title: 'Today', description: 'I need help today (day 0).' },
  { value: 'within_3_days', title: 'Within 3 days', description: 'I need help in the next 1–3 days.' },
  { value: 'within_7_days', title: 'Within 7 days', description: 'I need help in the next 4–7 days.' },
  { value: 'within_30_days', title: 'Within 30 days', description: 'I need help in the next 8–30 days.' },
  { value: 'planning', title: 'Planning ahead', description: 'More than 30 days away, or no set date yet.' },
];

const isIssue = (value: unknown): value is IssueType => ISSUE_TYPES.includes(value as IssueType);

/** The singular issue remains the primary concern for existing entry points. */
export function getConcerns(intake: Pick<IntakeProfile, 'issue' | 'issues'>): IssueType[] {
  return [...new Set(Array.isArray(intake.issues) ? intake.issues.filter(isIssue) : isIssue(intake.issue) ? [intake.issue] : [])];
}

export function normalizeIntake(value: unknown): IntakeProfile {
  const saved = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const issues = getConcerns(saved as IntakeProfile);
  const issue = isIssue(saved.issue) && issues.includes(saved.issue) ? saved.issue : issues[0] ?? null;
  const urgency = saved.urgency === 'this_week' ? 'within_7_days' : saved.urgency === 'this_month' ? 'within_30_days'
    : URGENCY_OPTIONS.some((option) => option.value === saved.urgency) ? saved.urgency as Urgency : null;
  return { ...saved, issues, issue, urgency, zipCode: typeof saved.zipCode === 'string' ? saved.zipCode : '',
    rentIncreaseCents: issues.includes('rent_increase') && typeof saved.rentIncreaseCents === 'number' && Number.isFinite(saved.rentIncreaseCents) && saved.rentIncreaseCents > 0 ? saved.rentIncreaseCents : undefined } as IntakeProfile;
}

export function patchIntake(intake: IntakeProfile, patch: Partial<IntakeProfile>): IntakeProfile {
  // Calculator entry points promote their concern without discarding other answers.
  const issues = patch.issues ?? (patch.issue ? [...new Set([...getConcerns(intake), patch.issue])] : getConcerns(intake));
  return normalizeIntake({ ...intake, ...patch, issues });
}

export function toggleConcern(intake: IntakeProfile, concern: IssueType): IntakeProfile {
  const current = getConcerns(intake);
  return patchIntake(intake, { issues: current.includes(concern) ? current.filter((issue) => issue !== concern) : [...current, concern] });
}

export function urgencyLabel(urgency: Urgency | null) {
  return URGENCY_OPTIONS.find((option) => option.value === urgency)?.title ?? 'No timeframe selected';
}

/** Preserve plans, files and comparison data while upgrading the intake schema. */
export function migrateProgress(value: unknown) {
  const saved = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return { ...saved, intake: normalizeIntake(saved.intake) };
}
