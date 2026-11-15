import { describe, expect, it, vi } from 'vitest';
import { fetchRemoteCatalog, parseCatalog, programProblem } from './catalogParser';
import { BUNDLED_CATALOG } from './programs';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const respond = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  (async () => ({ ok: init.ok ?? true, status: init.status ?? 200, json: async () => body })) as unknown as typeof fetch;

describe('bundled catalog', () => {
  it('passes its own validation, so the offline fallback is always usable', () => {
    expect(BUNDLED_CATALOG.programs.length).toBeGreaterThan(10);
    for (const program of [...BUNDLED_CATALOG.programs, BUNDLED_CATALOG.national211]) {
      expect(programProblem(program), program.id).toBeNull();
    }
    const parsed = parseCatalog(clone(BUNDLED_CATALOG));
    expect(parsed?.programs).toHaveLength(BUNDLED_CATALOG.programs.length);
  });
});

describe('parseCatalog', () => {
  it('skips a malformed program and keeps the rest', () => {
    const catalog = clone(BUNDLED_CATALOG) as any;
    catalog.programs[0].status = 'opne';
    delete catalog.programs[1].phone;
    delete catalog.programs[2].nextStep;
    const warn = vi.fn();
    const parsed = parseCatalog(catalog, warn);
    expect(parsed?.programs).toHaveLength(BUNDLED_CATALOG.programs.length - 2);
    expect(parsed?.programs.map((program) => program.id)).not.toContain(BUNDLED_CATALOG.programs[0].id);
    expect(parsed?.programs.map((program) => program.id)).toContain(BUNDLED_CATALOG.programs[1].id);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('unknown status "opne"');
  });

  it('rejects files that cannot be used at all', () => {
    expect(parseCatalog(null)).toBeNull();
    expect(parseCatalog('nope')).toBeNull();
    expect(parseCatalog({ programs: [] })).toBeNull();
    expect(parseCatalog({ ...clone(BUNDLED_CATALOG), programs: [] })).toBeNull();
    expect(parseCatalog({ ...clone(BUNDLED_CATALOG), national211: undefined })).toBeNull();
    expect(parseCatalog({ ...clone(BUNDLED_CATALOG), lastUpdated: undefined })).toBeNull();
  });
});

describe('fetchRemoteCatalog', () => {
  it('returns a validated catalog from a successful response', async () => {
    const edited = clone(BUNDLED_CATALOG);
    edited.lastUpdated = '2026-12-01';
    edited.programs[0].phone = '214-000-0000';
    const catalog = await fetchRemoteCatalog('https://example.test/catalog.json', respond(edited));
    expect(catalog.lastUpdated).toBe('2026-12-01');
    expect(catalog.programs[0].phone).toBe('214-000-0000');
  });

  it('throws on HTTP errors and invalid content so the caller keeps its current copy', async () => {
    await expect(fetchRemoteCatalog('https://example.test', respond({}, { ok: false, status: 404 }))).rejects.toThrow('404');
    await expect(fetchRemoteCatalog('https://example.test', respond({ unexpected: true }))).rejects.toThrow('missing required data');
    const badJson = (async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token'); } })) as unknown as typeof fetch;
    await expect(fetchRemoteCatalog('https://example.test', badJson)).rejects.toThrow();
  });

  it('gives up when the server never answers', async () => {
    const hang = ((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    })) as unknown as typeof fetch;
    await expect(fetchRemoteCatalog('https://example.test', hang, 20)).rejects.toThrow('aborted');
  });
});
