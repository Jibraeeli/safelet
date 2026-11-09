import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { getOnboardingData, setOnboardingAnswer } from '../../lib/onboarding';

/** Minimum characters before the Continue button is enabled. */
const MIN_LENGTH = 5;

export default function Question2() {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');

  // Pre-fill any previously saved answer so the user can see and edit it when
  // returning to this screen via the back button.
  useEffect(() => {
    let active = true;
    getOnboardingData().then((data) => {
      if (active && typeof data.postcode === 'string') {
        setPostcode(data.postcode);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isValid = postcode.trim().length >= MIN_LENGTH;

  const handleContinue = () => {
    if (!isValid) {
      return;
    }
    void setOnboardingAnswer('postcode', postcode.trim());
    router.push('/onboarding/question3');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            <Text style={styles.title}>What is the postcode of your property?</Text>
            <Text style={styles.subtitle}>
              We use this to check local licensing requirements
            </Text>

            <TextInput
              style={styles.input}
              value={postcode}
              onChangeText={setPostcode}
              placeholder="e.g. SW1A 1AA"
              placeholderTextColor={styles.placeholder.color}
              autoCapitalize="characters"
              autoCorrect={false}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

            <Text style={styles.helper}>
              Your postcode is stored securely and never shared
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.navy,
  },
  flex: {
    flex: 1,
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
    width: '40%',
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
  input: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: colours.cardBackground,
    color: colours.white,
    fontSize: 18,
    marginTop: 40,
  },
  // Referenced for the placeholder text colour (RN takes this as a prop).
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  helper: {
    color: colours.white,
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
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
});
