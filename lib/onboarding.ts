import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Onboarding answers collected across the onboarding flow.
 *
 * Every field is optional because the object is built up screen by screen as
 * the user progresses. Persisted to AsyncStorage so answers survive app
 * restarts mid-flow.
 */
/** Approximate tenant move-in date: month is 1-12 (1 = January). */
export interface MoveInDate {
  month: number;
  year: number;
}

export interface OnboardingData {
  /** Number of properties the landlord lets. 4 represents "4 or more". */
  propertyCount?: number;
  /** Property postcode. */
  postcode?: string;
  /** Approximate tenant move-in date. */
  moveInDate?: MoveInDate;
  /** Whether the landlord manages the property themselves. */
  selfManaging?: boolean;
  /** IDs of the compliance items relevant to this landlord. */
  complianceItems?: string[];
}

const STORAGE_KEY = 'safelet:onboarding';

/** Read the full onboarding object. Returns an empty object if nothing saved. */
export async function getOnboardingData(): Promise<OnboardingData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : {};
  } catch {
    return {};
  }
}

/**
 * Merge a partial update into the stored onboarding object and persist it.
 * Returns the merged result.
 */
export async function saveOnboardingData(
  patch: Partial<OnboardingData>,
): Promise<OnboardingData> {
  const current = await getOnboardingData();
  const next: OnboardingData = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Save a single onboarding answer by key. */
export async function setOnboardingAnswer<K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K],
): Promise<OnboardingData> {
  return saveOnboardingData({ [key]: value } as Partial<OnboardingData>);
}

/** Remove all stored onboarding answers (e.g. to restart the flow). */
export async function clearOnboardingData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
