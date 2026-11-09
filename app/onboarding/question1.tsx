import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { getOnboardingData, setOnboardingAnswer } from '../../lib/onboarding';

interface Option {
  label: string;
  /** Stored value. 4 represents "4 or more". */
  value: number;
}

const OPTIONS: Option[] = [
  { label: '1 property', value: 1 },
  { label: '2 properties', value: 2 },
  { label: '3 properties', value: 3 },
  { label: '4 or more properties', value: 4 },
];

export default function Question1() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  // Pre-select any previously saved answer so the user can see and change it
  // when returning to this screen via the back button.
  useEffect(() => {
    let active = true;
    getOnboardingData().then((data) => {
      if (active && typeof data.propertyCount === 'number') {
        setSelected(data.propertyCount);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleContinue = () => {
    if (selected === null) {
      return;
    }
    void setOnboardingAnswer('propertyCount', selected);
    router.push('/onboarding/question2');
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
          <Text style={styles.title}>How many properties do you let?</Text>
          <Text style={styles.subtitle}>
            This app is built for landlords with 1-3 properties
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((option) => {
              const isSelected = selected === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelected(option.value)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selected === 4 && (
            <Text style={styles.warning}>
              SafeLet is optimised for 1-3 properties but you can still use it
            </Text>
          )}
        </View>

        {/* Bottom: Continue (only once a selection is made) */}
        <View style={styles.bottomSection}>
          {selected !== null && (
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          )}
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
    width: '20%',
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
  options: {
    alignItems: 'center',
    marginTop: 16,
  },
  optionButton: {
    width: 350,
    maxWidth: '100%',
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: colours.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  optionButtonSelected: {
    backgroundColor: colours.green,
    borderColor: colours.green,
  },
  optionText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  warning: {
    color: colours.amber,
    fontSize: 14,
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
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
