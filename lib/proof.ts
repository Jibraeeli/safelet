import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addProvenId,
  clearProvenIds,
  removeProvenId,
} from './complianceStatus';

/** A file the user has selected but not necessarily saved yet. */
export interface SelectedProofFile {
  /** Local URI of the captured photo or picked file. */
  uri: string;
  /** Display file name. */
  name: string;
  /** File size in bytes, if known. */
  size?: number;
  /** MIME type, if known. */
  mimeType?: string;
  /** 'image' or 'pdf'. */
  kind: 'image' | 'pdf';
}

/** A proof record stored locally for a compliance item. */
export interface ProofRecord {
  /** Compliance item ID this proof belongs to. */
  id: string;
  /** Original file name. */
  fileName: string;
  /** Local URI of the captured photo or picked file. */
  fileUri: string;
  /** File size in bytes, if known. */
  fileSize?: number;
  /** MIME type, if known. */
  mimeType?: string;
  /** 'image' or 'pdf'. */
  kind: 'image' | 'pdf';
  /** ISO timestamp of when the proof was saved. */
  timestamp: string;
}

const proofKey = (id: string) => `safelet:proof:${id}`;
const draftKey = (id: string) => `safelet:proofDraft:${id}`;

/** Read the stored proof for an item, or null if none. */
export async function getProof(id: string): Promise<ProofRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(proofKey(id));
    return raw ? (JSON.parse(raw) as ProofRecord) : null;
  } catch {
    return null;
  }
}

/**
 * Persist a proof record locally and mark its item as proven. Clears any
 * pending draft for the item.
 *
 * Stored in AsyncStorage only for now - this is where Supabase storage will be
 * wired in later.
 */
export async function saveProof(record: ProofRecord): Promise<void> {
  await AsyncStorage.setItem(proofKey(record.id), JSON.stringify(record));
  await clearProofDraft(record.id);
  await addProvenId(record.id);
}

/*
 * Draft = a selected-but-not-yet-saved file. We persist it so the selection
 * survives the upload screen remounting when the OS recreates the host while
 * the camera or document picker is in the foreground (common on Android).
 */

/** Read the pending draft selection for an item, or null if none. */
export async function getProofDraft(
  id: string,
): Promise<SelectedProofFile | null> {
  try {
    const raw = await AsyncStorage.getItem(draftKey(id));
    return raw ? (JSON.parse(raw) as SelectedProofFile) : null;
  } catch {
    return null;
  }
}

/** Persist a pending draft selection for an item. */
export async function saveProofDraft(
  id: string,
  file: SelectedProofFile,
): Promise<void> {
  await AsyncStorage.setItem(draftKey(id), JSON.stringify(file));
}

/** Remove the pending draft selection for an item. */
export async function clearProofDraft(id: string): Promise<void> {
  await AsyncStorage.removeItem(draftKey(id));
}

/**
 * Fully remove proof for an item: delete the stored record, drop the item from
 * the proven list (so the score recalculates and status reverts), and clear any
 * pending draft.
 */
export async function removeProof(id: string): Promise<void> {
  await AsyncStorage.removeItem(proofKey(id));
  await clearProofDraft(id);
  await removeProvenId(id);
}

/**
 * Clear every proof and draft for all items, and reset the proven list. Used by
 * the "Start Over" reset flow.
 */
export async function clearAllProof(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter(
    (key) =>
      key.startsWith('safelet:proof:') || key.startsWith('safelet:proofDraft:'),
  );
  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }
  await clearProvenIds();
}
