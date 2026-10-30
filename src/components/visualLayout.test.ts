import { describe, expect, it } from 'vitest';
import { getIssueTileColumns } from './visualLayout';

describe('getIssueTileColumns', () => {
  it('uses a single column on very narrow phones', () => {
    expect(getIssueTileColumns(320)).toBe(1);
  });

  it('uses two compact columns on standard phones', () => {
    expect(getIssueTileColumns(375)).toBe(2);
  });
});
