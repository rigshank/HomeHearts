import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { DocumentKind, DocumentRecord } from '../domain/types';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export async function pickAndStageDocument(kind: DocumentKind): Promise<DocumentRecord | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? mimeTypeFromName(asset.name);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Use a PDF, JPG, PNG, or WebP file.');
  if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) throw new Error('Files must be smaller than 10 MB.');
  const stagedUri = await copyToPrivateCache(asset.uri, kind, asset.name);
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Secure cloud upload is not ready for this session. Your file was not sent anywhere; continue with local staging or sign in first.');
    const body = await (await fetch(stagedUri)).blob();
    const remotePath = `anonymous/${kind}/${Date.now()}-${asset.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error } = await supabase.storage.from('homehearts-documents').upload(remotePath, body, { contentType: mimeType, upsert: false });
    if (error) throw new Error('The private upload could not be completed. Your local file is still staged; try again or contact the provider another way.');
    return { kind, state: 'uploaded', name: asset.name, mimeType, sizeBytes: asset.size, localUri: stagedUri, remotePath, storageMode: 'supabase_private', updatedAt: new Date().toISOString() };
  }
  return { kind, state: 'uploaded', name: asset.name, mimeType, sizeBytes: asset.size, localUri: stagedUri, storageMode: 'local_cache', updatedAt: new Date().toISOString() };
}

export async function removeStagedDocument(record: DocumentRecord): Promise<void> {
  if (record.localUri) {
    try { new File(record.localUri).delete(); } catch { /* best-effort cleanup; metadata remains available to retry */ }
  }
  if (record.remotePath && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Your secure session expired; the remote document was retained. Sign in again before removing it.');
    const { error } = await supabase.storage.from('homehearts-documents').remove([record.remotePath]);
    if (error) throw new Error('The remote document could not be removed. It is still referenced in your plan.');
  }
}

async function copyToPrivateCache(uri: string, kind: DocumentKind, name: string): Promise<string> {
  try {
    const safeName = `${kind}-${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const target = new File(Paths.cache, safeName);
    const source = new File(uri);
    source.copy(target);
    return target.uri;
  } catch {
    return uri;
  }
}

function mimeTypeFromName(name: string): string {
  const extension = name.toLowerCase().split('.').pop();
  return extension === 'pdf' ? 'application/pdf' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'application/octet-stream';
}

