export type IssueType = 'rent_increase' | 'eviction' | 'utilities' | 'homeless' | 'shelter' | 'moving' | 'legal' | 'domestic_violence' | 'disability' | 'veteran' | 'youth' | 'general';
export type Urgency = 'today' | 'this_week' | 'this_month' | 'planning';
export type ProgramStatus = 'open' | 'waitlist' | 'closed' | 'referral_required' | 'call_to_verify' | 'unknown';
export type ProgramCategory = 'rent' | 'utilities' | 'shelter' | 'legal' | 'housing' | 'moving' | 'general';
export type DocumentKind = 'photo_id' | 'lease_or_rent_notice' | 'income_proof' | 'rent_increase_notice';
export type DocumentUploadState = 'missing' | 'uploaded' | 'uploading' | 'error';
export type TaskStatus = 'todo' | 'done' | 'skipped';

export type IntakeProfile = { issue: IssueType | null; urgency: Urgency | null; city: string; zipCode: string; rentIncreaseCents?: number };

export type Program = {
  id: string; name: string; provider: string; category: ProgramCategory; description: string; coverage: string;
  status: ProgramStatus; statusLabel: string; sourceUrl: string; sourceLabel: string; phone?: string;
  verifiedAt: string; verificationNote: string; eligibility: string[]; matchableIssues: IssueType[];
  assistance: { amountLabel: string; durationLabel: string; methodLabel: string }; requiredDocuments: DocumentKind[];
  deadlineLabel?: string; tags: string[];
};

export type MatchResult = { program: Program; score: number; matchedReasons: string[]; unknownReasons: string[] };
export type ComparisonInput = { monthlyStayCents: number; monthlyStayAfterIncreaseCents: number; movingUpfrontCents: number; movingMonthlyCents: number; horizonMonths: 3 | 12 };
export type ComparisonPoint = { month: number; stayCents: number; moveCents: number };
export type ComparisonResult = { horizonMonths: 3 | 12; stayTotalCents: number; moveTotalCents: number; breakEvenMonth: number | null; points: ComparisonPoint[]; warnings: string[] };
export type DocumentRecord = { kind: DocumentKind; state: DocumentUploadState; name?: string; mimeType?: string; sizeBytes?: number; localUri?: string; remotePath?: string; storageMode?: 'local_cache' | 'supabase_private'; updatedAt?: string; errorMessage?: string };
export type PlanTask = { id: string; title: string; detail: string; dueLabel: string; status: TaskStatus; source: 'document' | 'call' | 'application' | 'follow_up' };

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  photo_id: 'Photo ID', lease_or_rent_notice: 'Lease or rent notice', income_proof: 'Income proof', rent_increase_notice: 'Rent increase notice',
};
export const DOCUMENT_HINTS: Record<DocumentKind, string> = {
  photo_id: 'Driver license, state ID, passport, or other government-issued ID.',
  lease_or_rent_notice: 'Current lease, rent ledger, or a recent rent statement.',
  income_proof: 'Pay stubs, benefits statement, or a bank statement showing income.',
  rent_increase_notice: 'The letter, email, or notice showing your rent change.',
};

