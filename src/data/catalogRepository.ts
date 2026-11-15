import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catalog } from '../domain/types';
import { DEFAULT_CATALOG_URL, fetchRemoteCatalog, parseCatalog } from './catalogParser';

const CACHE_KEY = 'homehearts-catalog-cache-v1';

export const CATALOG_URL = process.env.EXPO_PUBLIC_CATALOG_URL || DEFAULT_CATALOG_URL;

/** The last catalog that downloaded successfully, if any. Re-validated on every read. */
export async function readCachedCatalog(): Promise<Catalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? parseCatalog(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

async function writeCachedCatalog(catalog: Catalog) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    // The cache is only a convenience. The next launch simply downloads again.
  }
}

export async function downloadCatalog(): Promise<Catalog> {
  const catalog = await fetchRemoteCatalog(CATALOG_URL);
  await writeCachedCatalog(catalog);
  return catalog;
}
