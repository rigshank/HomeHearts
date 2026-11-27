import { Catalog, Program } from '../domain/types';

// Where the live catalog is downloaded from. The same file is bundled in the app
// as an offline fallback, so a failed download never leaves the app empty.
// Override with EXPO_PUBLIC_CATALOG_URL to point at a fork or a test file.
export const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/rigshank/HomeHearts/main/src/data/catalog.json';
export const FETCH_TIMEOUT_MS = 6000;

const STATUSES = ['open', 'waitlist', 'closed', 'referral_required', 'call_to_verify', 'unknown'];
const CATEGORIES = ['rent', 'utilities', 'shelter', 'legal', 'housing', 'moving', 'general'];
const KINDS = ['direct', 'referral', 'long_term'];
const AREA_KINDS = ['nationwide', 'texas', 'dallas_city', 'counties'];
const DOCUMENT_KINDS = ['photo_id', 'lease_or_rent_notice', 'income_proof', 'rent_increase_notice'];

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Returns the reason a program is unusable, or null when it has everything the screens read. */
export function programProblem(value: unknown): string | null {
  if (!isRecord(value)) return 'not an object';
  for (const key of ['id', 'name', 'provider', 'description', 'coverage', 'sourceUrl', 'sourceLabel', 'verifiedAt', 'verificationNote', 'nextStep']) {
    if (!isString(value[key])) return `missing "${key}"`;
  }
  if (!STATUSES.includes(value.status as string)) return `unknown status "${String(value.status)}"`;
  if (!CATEGORIES.includes(value.category as string)) return `unknown category "${String(value.category)}"`;
  if (!KINDS.includes(value.kind as string)) return `unknown kind "${String(value.kind)}"`;
  if (!isRecord(value.serviceArea) || !AREA_KINDS.includes(value.serviceArea.kind as string)) return 'invalid serviceArea';
  if (value.serviceArea.kind === 'counties' && !isStringArray(value.serviceArea.counties)) return 'serviceArea.counties must be a list';
  if (!isStringArray(value.serviceTypes) || value.serviceTypes.length === 0) return 'serviceTypes must be a non-empty list';
  if (!isStringArray(value.eligibility)) return 'eligibility must be a list';
  if (!Array.isArray(value.requiredDocuments) || !value.requiredDocuments.every((kind) => DOCUMENT_KINDS.includes(kind))) return 'invalid requiredDocuments';
  for (const key of ['deadline', 'reopening']) {
    const timing = value[key];
    if (timing === undefined) continue;
    if (!isRecord(timing) || !isString(timing.at) || !isString(timing.label) ||
      !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(timing.at) || !Number.isFinite(Date.parse(timing.at))) {
      return `invalid ${key}: expected a timestamp with timezone and a published label`;
    }
  }
  const assistance = value.assistance;
  if (!isRecord(assistance) || !isString(assistance.amountLabel) || !isString(assistance.durationLabel) || !isString(assistance.methodLabel)) return 'invalid assistance';
  return null;
}

/**
 * Validates downloaded catalog data. A single malformed program (for example a
 * typo made while editing the file on GitHub) is skipped so it cannot crash a
 * screen; the rest of the catalog still loads. Returns null when the file is
 * unusable as a whole, so the caller keeps its saved or bundled copy.
 */
export function parseCatalog(value: unknown, warn: (message: string) => void = () => {}): Catalog | null {
  if (!isRecord(value) || !Array.isArray(value.programs) || !isString(value.lastUpdated)) return null;
  if (programProblem(value.national211)) return null;

  const programs: Program[] = [];
  for (const candidate of value.programs) {
    const problem = programProblem(candidate);
    if (problem) warn(`Skipped catalog entry ${isRecord(candidate) ? String(candidate.id) : '?'}: ${problem}`);
    else programs.push(candidate as Program);
  }
  if (programs.length === 0) return null;
  return { lastUpdated: value.lastUpdated, programs, national211: value.national211 as Program };
}

/** Downloads and validates the catalog. Throws on network, timeout, or format problems. */
export async function fetchRemoteCatalog(
  url: string = DEFAULT_CATALOG_URL,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Catalog> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Catalog download failed (${response.status})`);
    const catalog = parseCatalog(await response.json(), (message) => console.warn(message));
    if (!catalog) throw new Error('Catalog file is missing required data');
    return catalog;
  } finally {
    clearTimeout(timer);
  }
}
