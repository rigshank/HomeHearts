import { Catalog } from '../domain/types';
import catalogJson from './catalog.json';

// The program catalog lives in catalog.json. This file exposes the copy bundled
// into the app, which is the offline fallback. At runtime the app also fetches
// the same file from GitHub (see catalogRepository.ts), so editing catalog.json
// on the main branch updates the live list without shipping a new build.
export const BUNDLED_CATALOG = catalogJson as unknown as Catalog;

export const DALLAS_PROGRAMS = BUNDLED_CATALOG.programs;
export const NATIONAL_211 = BUNDLED_CATALOG.national211;
export const PROGRAMS = [...DALLAS_PROGRAMS, NATIONAL_211];
