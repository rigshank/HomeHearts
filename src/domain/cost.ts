import { ComparisonInput, ComparisonResult } from './types';

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

export function calculateComparison(input: ComparisonInput): ComparisonResult {
  const monthlyStay = input.monthlyStayAfterIncreaseCents || input.monthlyStayCents;
  const points = Array.from({ length: input.horizonMonths }, (_, index) => {
    const month = index + 1;
    return { month, stayCents: monthlyStay * month, moveCents: input.movingUpfrontCents + input.movingMonthlyCents * month };
  });
  const breakEven = points.find((point) => point.moveCents <= point.stayCents)?.month ?? null;
  const warnings: string[] = [];
  if (!input.movingUpfrontCents) warnings.push('Add your moving upfront cost for a more useful comparison.');
  if (!input.movingMonthlyCents) warnings.push('Add your expected monthly cost after moving.');
  if (input.monthlyStayAfterIncreaseCents < input.monthlyStayCents) warnings.push('The after-increase rent is below the current rent; check your inputs.');
  return { horizonMonths: input.horizonMonths, stayTotalCents: monthlyStay * input.horizonMonths, moveTotalCents: input.movingUpfrontCents + input.movingMonthlyCents * input.horizonMonths, breakEvenMonth: breakEven, points, warnings };
}

