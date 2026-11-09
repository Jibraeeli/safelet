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

export default function Question4() {
  const router = useRouter();
  // true = self-managing, false = uses an agent, null = no choice yet.
  const [selfManaging, setSelfManaging] = useState<boolean | null>(null);

  // Pre-fill any previously saved answer so the user can see and edit it when
  // returning to this screen via the back button.
  useEffect(() => {
    let active = true;
    getOnboardingData().then((data) => {
      if (active && typeof data.selfManaging === 'boolean') {
        setSelfManaging(data.selfManaging);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isValid = selfManaging !== null;

  const handleContinue = () => {
    if (selfManaging === null) {
      return;
    }
    void setOnboardingAnswer('selfManaging', selfManaging);
    router.push('/onboarding/question5');
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
          <Text style={styles.title}>How do you manage your properties?</Text>
          <Text style={styles.subtitle}>
            This helps us tailor your compliance checklist
          </Text>

          {/* Card 1 - Self managing */}
          <TouchableOpacity
            style={[styles.card, selfManaging === true && styles.cardSelfSelected]}
            activeOpacity={0.85}
            onPress={() => setSelfManaging(true)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="home" size={32} color={colours.green} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>I manage it myself</Text>
              <Text style={styles.cardSubtitle}>
                Full compliance checklist for you
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2 - Using an agent */}
          <TouchableOpacity
            style={[styles.card, selfManaging === false && styles.cardAgentSelected]}
            activeOpacity={0.85}
            onPress={() => setSelfManaging(false)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="business" size={32} color={colours.amber} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>I use a letting agent</Text>
              <Text style={styles.cardSubtitle}>
                We will flag what agents sometimes miss
              </Text>
            </View>
          </TouchableOpacity>
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
    width: '80%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colours.green,
  },
  content: {
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: colours.cardBackground,
    marginTop: 16,
  },
  cardSelfSelected: {
    borderWidth: 2,
    borderColor: colours.green,
    backgroundColor: '#1a3a2a',
  },
  cardAgentSelected: {
    borderWidth: 2,
    borderColor: colours.amber,
    backgroundColor: '#2a2a1a',
  },
  iconWrap: {
    paddingLeft: 20,
    paddingRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: colours.white,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
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
