import { describe, expect, it } from 'vitest';
import { calculateComparison } from './cost';

describe('calculateComparison', () => {
  it('uses one model for a 12-month staying-versus-moving comparison', () => {
    const result = calculateComparison({ monthlyStayCents: 145000, monthlyStayAfterIncreaseCents: 160000, movingUpfrontCents: 320000, movingMonthlyCents: 135000, horizonMonths: 12 });
    expect(result.stayTotalCents).toBe(1920000);
    expect(result.moveTotalCents).toBe(1940000);
    expect(result.points).toHaveLength(12);
    expect(result.breakEvenMonth).toBeNull();
  });

  it('warns when the moving inputs are incomplete', () => {
    const result = calculateComparison({ monthlyStayCents: 120000, monthlyStayAfterIncreaseCents: 120000, movingUpfrontCents: 0, movingMonthlyCents: 0, horizonMonths: 3 });
    expect(result.warnings).toEqual(expect.arrayContaining(['Add your moving upfront cost for a more useful comparison.', 'Add your expected monthly cost after moving.']));
  });
});

