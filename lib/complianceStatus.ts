import AsyncStorage from '@react-native-async-storage/async-storage';

import { ComplianceItem } from '../constants/compliance';

/** Traffic-light status for a single compliance item. */
export type ItemStatus = 'red' | 'amber' | 'green';

/** AsyncStorage key holding the array of item IDs that have proof uploaded. */
const PROVEN_IDS_KEY = 'safelet:provenIds';

/** Read the IDs of items that have proof uploaded. */
export async function getProvenIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PROVEN_IDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Mark an item as proven (idempotent). Returns the updated list. */
export async function addProvenId(id: string): Promise<string[]> {
  const current = await getProvenIds();
  if (current.includes(id)) {
    return current;
  }
  const next = [...current, id];
  await AsyncStorage.setItem(PROVEN_IDS_KEY, JSON.stringify(next));
  return next;
}

/** Remove an item from the proven list (idempotent). Returns the updated list. */
export async function removeProvenId(id: string): Promise<string[]> {
  const current = await getProvenIds();
  if (!current.includes(id)) {
    return current;
  }
  const next = current.filter((value) => value !== id);
  await AsyncStorage.setItem(PROVEN_IDS_KEY, JSON.stringify(next));
  return next;
}

/** Clear the entire proven list. */
export async function clearProvenIds(): Promise<void> {
  await AsyncStorage.removeItem(PROVEN_IDS_KEY);
}

/**
 * Resolve an item's status from the onboarding claims and uploaded proof,
 * including item-specific special cases.
 *
 * - Green: proof has been uploaded.
 * - Amber: claimed in onboarding but not yet proven.
 * - Red: neither claimed nor proven.
 *
 * Special case: the PRS database registration is always amber until the 2027
 * scheme opens, regardless of onboarding answers or proof.
 */
export function getItemStatus(
  item: ComplianceItem,
  claimedIds: string[],
  provenIds: string[],
): ItemStatus {
  if (item.id === 'prs-database') {
    return 'amber';
  }
  if (provenIds.includes(item.id)) {
    return 'green';
  }
  if (claimedIds.includes(item.id)) {
    return 'amber';
  }
  return 'red';
}
