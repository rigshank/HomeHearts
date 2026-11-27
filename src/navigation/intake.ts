import type { IntakeProfile } from '../domain/types';

export type IntakeStep = 0 | 1 | 2;
type QueryValue = string | string[] | undefined;
type IntakeParams = { step?: QueryValue; location?: QueryValue };

export function getRequestedIntakeStep(params: IntakeParams): IntakeStep {
  return params.step === undefined && params.location === '1' ? 2
    : params.step === '1' ? 1 : params.step === '2' ? 2 : 0;
}

/** A deep link may request a later question, but cannot skip missing answers. */
export function getIntakeStep(params: IntakeParams, intake: IntakeProfile): IntakeStep {
  const requested = getRequestedIntakeStep(params);
  if (requested > 0 && !intake.issue) return 0;
  if (requested > 1 && !intake.urgency) return 1;
  return requested;
}
