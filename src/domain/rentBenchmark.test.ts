import { describe, expect, it } from 'vitest';
import texasZipAreas from '../data/texasZipAreas.json';
import { BEDROOM_OPTIONS, getRentBenchmark } from './rentBenchmark';

describe('getRentBenchmark', () => {
  it('returns HUD’s FY2027 ZIP-level rent in cents for each bedroom count', () => {
    expect(getRentBenchmark('75201', 0)?.cents).toBe(224000);
    expect(getRentBenchmark('75201', 2)).toMatchObject({ cents: 271000, bedrooms: 2, fiscalYear: 2027 });
    expect(getRentBenchmark('75080', 4)?.cents).toBe(333000);
  });

  it('differs by ZIP, which a single metro-wide figure would hide', () => {
    const downtown = getRentBenchmark('75201', 2)!.cents;
    const richardson = getRentBenchmark('75080', 2)!.cents;
    expect(downtown).toBeGreaterThan(richardson);
  });

  it('ignores surrounding whitespace and rejects unusable input', () => {
    expect(getRentBenchmark(' 75201 ', 1)).not.toBeNull();
    expect(getRentBenchmark('7520', 1)).toBeNull();
    expect(getRentBenchmark('75ABC', 1)).toBeNull();
    expect(getRentBenchmark('', 1)).toBeNull();
    expect(getRentBenchmark('98101', 1)).toBeNull(); // Seattle: outside the Texas ZIPs the app covers
    expect(getRentBenchmark('75201', 5)).toBeNull();
    expect(getRentBenchmark('75201', -1)).toBeNull();
  });

  it('has a benchmark for every Texas ZIP the app recognises, at every bedroom size', () => {
    const zips = Object.values(texasZipAreas.countyGroups).flatMap((group) => group.split(' '));
    expect(zips.length).toBeGreaterThan(1900);
    for (const zip of zips) {
      for (const { value } of BEDROOM_OPTIONS) expect(getRentBenchmark(zip, value), `${zip} ${value}BR`).not.toBeNull();
    }
  });

  it('never lists a smaller unit as more expensive than a bigger one', () => {
    const zips = Object.values(texasZipAreas.countyGroups).flatMap((group) => group.split(' '));
    for (const zip of zips) {
      const cents = BEDROOM_OPTIONS.map(({ value }) => getRentBenchmark(zip, value)!.cents);
      expect(cents, zip).toEqual([...cents].sort((a, b) => a - b));
    }
  });
});
