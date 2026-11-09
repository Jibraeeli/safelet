import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { getOnboardingData, setOnboardingAnswer } from '../../lib/onboarding';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const FIRST_YEAR = 2015;

/** Years from 2015 through the current year, oldest first. */
function buildYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = FIRST_YEAR; y <= currentYear; y += 1) {
    years.push(y);
  }
  return years;
}

interface PickerOption {
  label: string;
  value: number;
}

type PickerType = 'month' | 'year';

export default function Question3() {
  const router = useRouter();
  const [month, setMonth] = useState<number | null>(null); // 1-12
  const [year, setYear] = useState<number | null>(null);
  const [openPicker, setOpenPicker] = useState<PickerType | null>(null);

  const years = buildYears();

  // Pre-fill any previously saved answer so the user can see and edit it when
  // returning to this screen via the back button.
  useEffect(() => {
    let active = true;
    getOnboardingData().then((data) => {
      if (active && data.moveInDate) {
        setMonth(data.moveInDate.month);
        setYear(data.moveInDate.year);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isValid = month !== null && year !== null;

  const handleContinue = () => {
    if (month === null || year === null) {
      return;
    }
    void setOnboardingAnswer('moveInDate', { month, year });
    router.push('/onboarding/question4');
  };

  const monthLabel = month === null ? 'Month' : MONTHS[month - 1];
  const yearLabel = year === null ? 'Year' : String(year);

  // Options + currently selected value for whichever picker is open.
  const pickerOptions: PickerOption[] =
    openPicker === 'month'
      ? MONTHS.map((label, index) => ({ label, value: index + 1 }))
      : years.map((y) => ({ label: String(y), value: y }));
  const pickerSelected = openPicker === 'month' ? month : year;

  const handlePick = (value: number) => {
    if (openPicker === 'month') {
      setMonth(value);
    } else if (openPicker === 'year') {
      setYear(value);
    }
    setOpenPicker(null);
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

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>When did your current tenant move in?</Text>
          <Text style={styles.subtitle}>
            This helps us calculate certificate expiry dates and deadlines
          </Text>

          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.85}
              onPress={() => setOpenPicker('month')}
            >
              <Text style={styles.dropdownText}>{monthLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.85}
              onPress={() => setOpenPicker('year')}
            >
              <Text style={styles.dropdownText}>{yearLabel}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helper}>
            Not sure of the exact date? Pick the approximate month and year
          </Text>
        </View>

        {/* Bottom: Continue */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            activeOpacity={0.85}
            disabled={!isValid}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom-sheet picker */}
      <Modal
        visible={openPicker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenPicker(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpenPicker(null)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
            >
              {pickerOptions.map((option) => {
                const isSelected = pickerSelected === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => handlePick(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    width: '60%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colours.green,
  },
  content: {
    marginTop: 80,
    alignItems: 'center',
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
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
  },
  dropdown: {
    width: '48%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: colours.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownText: {
    color: colours.white,
    fontSize: 16,
  },
  helper: {
    color: colours.white,
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomSection: {
    marginTop: 'auto',
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
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Picker bottom sheet
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colours.navy,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  optionRow: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: colours.white,
    fontSize: 17,
  },
  optionTextSelected: {
    color: colours.green,
    fontWeight: '600',
  },
});
