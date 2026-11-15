import hudRentsJson from '../data/hudRents.json';
import { isZipCode } from './serviceArea';

// HUD publishes a Small Area Fair Market Rent (SAFMR) for every ZIP code in the
// Dallas area. It is the benchmark HUD uses to cap housing voucher payments, so
// it is a reasonable reference for what a rental costs in a ZIP, but it is not
// an average of current listings. Regenerate hudRents.json with
// scripts/build-hud-rents.py when HUD publishes a new fiscal year.
type HudRents = { fiscalYear: number; source: string; sourceUrl: string; zips: Record<string, number[]> };
const hudRents = hudRentsJson as unknown as HudRents;

export const BEDROOM_OPTIONS = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 bed' },
  { value: 2, label: '2 bed' },
  { value: 3, label: '3 bed' },
  { value: 4, label: '4 bed' },
] as const;

export type RentBenchmark = { cents: number; bedrooms: number; fiscalYear: number; source: string; sourceUrl: string };

/** Monthly HUD benchmark rent for a ZIP and bedroom count, or null when HUD has no figure for it. */
export function getRentBenchmark(zipCode: string, bedrooms: number): RentBenchmark | null {
  const zip = zipCode.trim();
  if (!isZipCode(zip)) return null;
  const dollars = hudRents.zips[zip]?.[bedrooms];
  if (!dollars) return null;
  return { cents: dollars * 100, bedrooms, fiscalYear: hudRents.fiscalYear, source: hudRents.source, sourceUrl: hudRents.sourceUrl };
}
