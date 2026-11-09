import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { getOnboardingData, setOnboardingAnswer } from '../../lib/onboarding';

/**
 * Sentinel id for the "None of the above" row. It is mutually exclusive with
 * every real item and is never persisted - selecting it saves an empty array.
 */
const NONE_ID = 'none';

interface ComplianceOption {
  /** ID persisted in onboarding storage. */
  id: string;
  /** Display name shown in the UI. */
  name: string;
}

const ITEMS: ComplianceOption[] = [
  { id: 'gas-safety', name: 'Gas Safety Certificate' },
  { id: 'eicr', name: 'Electrical Check (EICR)' },
  { id: 'epc', name: 'Energy Performance Certificate (EPC)' },
  { id: 'deposit-protection', name: 'Deposit protected in a scheme' },
  { id: 'how-to-rent', name: 'How to Rent guide given to tenant' },
  {
    id: 'renters-rights-sheet',
    name: 'Renters Rights Information Sheet sent to tenant',
  },
  { id: NONE_ID, name: 'None of the above' },
];

/** IDs that may appear in saved data (excludes the UI-only "none" sentinel). */
const PERSISTABLE_IDS = ITEMS.map((item) => item.id).filter(
  (id) => id !== NONE_ID,
);

export default function Question5() {
  const router = useRouter();
  // Holds selected item IDs, plus the NONE_ID sentinel while "none" is active.
  const [selected, setSelected] = useState<string[]>([]);

  // Pre-fill any previously saved answer so the user can see and edit it when
  // returning to this screen via the back button. Saved data holds IDs, which
  // map straight back onto the matching checkboxes.
  useEffect(() => {
    let active = true;
    getOnboardingData().then((data) => {
      if (active && Array.isArray(data.complianceItems)) {
        setSelected(
          data.complianceItems.filter((id) => PERSISTABLE_IDS.includes(id)),
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleItem = (id: string) => {
    setSelected((current) => {
      if (id === NONE_ID) {
        // "None of the above" clears everything else (and toggles itself).
        return current.includes(NONE_ID) ? [] : [NONE_ID];
      }
      // Any real item deselects "None of the above".
      const withoutNone = current.filter((value) => value !== NONE_ID);
      return withoutNone.includes(id)
        ? withoutNone.filter((value) => value !== id)
        : [...withoutNone, id];
    });
  };

  const handleSubmit = () => {
    // "None of the above" persists as an empty array; otherwise save the IDs.
    const ids = selected.includes(NONE_ID) ? [] : selected;
    void setOnboardingAnswer('complianceItems', ids);
    router.push('/onboarding/analysing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Top: back arrow + progress bar */}
        <View style={styles.topSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colours.white} />
          </TouchableOpacity>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Which of these do you already have in place?
          </Text>
          <Text style={styles.subtitle}>
            Select all that apply - be honest, this helps us find your real gaps
          </Text>
        </View>

        {/* Scrollable list */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {ITEMS.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => toggleItem(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <Text style={styles.rowText}>{item.name}</Text>
                <View
                  style={[styles.checkbox, checked && styles.checkboxChecked]}
                >
                  {checked && (
                    <Ionicons name="checkmark" size={16} color={colours.white} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.note}>
            Items you select will show as amber - claimed but not yet proven.
            Upload documents to turn them green.
          </Text>
        </ScrollView>

        {/* Bottom: submit (always enabled) */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>See My Compliance Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.navy,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topSection: {
    paddingTop: 8,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colours.cardBackground,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colours.green,
  },
  header: {
    marginTop: 80,
  },
  title: {
    color: colours.white,
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colours.white,
    fontSize: 16,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 8,
  },
  list: {
    flex: 1,
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 64,
    borderRadius: 12,
    backgroundColor: colours.cardBackground,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
    color: colours.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colours.green,
    borderColor: colours.green,
  },
  note: {
    color: colours.white,
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomSection: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: colours.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
