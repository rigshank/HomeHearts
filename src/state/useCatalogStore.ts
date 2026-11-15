import { create } from 'zustand';
import { downloadCatalog, readCachedCatalog } from '../data/catalogRepository';
import { BUNDLED_CATALOG } from '../data/programs';
import { Catalog, Program } from '../domain/types';

// 'bundled' = copy shipped inside the app, 'cache' = last successful download,
// 'remote' = downloaded this session.
export type CatalogSource = 'bundled' | 'cache' | 'remote';

type CatalogState = {
  programs: Program[];
  national211: Program;
  /** Every program including the national 211 fallback, for lookups by id. */
  allPrograms: Program[];
  lastUpdated: string;
  source: CatalogSource;
  syncing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const fromCatalog = (catalog: Catalog, source: CatalogSource) => ({
  programs: catalog.programs,
  national211: catalog.national211,
  allPrograms: [...catalog.programs, catalog.national211],
  lastUpdated: catalog.lastUpdated,
  source,
});

export const useCatalogStore = create<CatalogState>((set, get) => ({
  ...fromCatalog(BUNDLED_CATALOG, 'bundled'),
  syncing: false,
  error: null,
  refresh: async () => {
    if (get().syncing) return;
    set({ syncing: true, error: null });
    if (get().source === 'bundled') {
      const cached = await readCachedCatalog();
      if (cached) set(fromCatalog(cached, 'cache'));
    }
    try {
      set(fromCatalog(await downloadCatalog(), 'remote'));
    } catch (error) {
      // Keep whatever copy is already showing; the screens note which one it is.
      set({ error: error instanceof Error ? error.message : 'Could not reach the catalog.' });
    } finally {
      set({ syncing: false });
    }
  },
}));
