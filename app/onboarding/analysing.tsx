import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShieldLogo from '../../components/ShieldLogo';
import { colours } from '../../constants/colours';
import { getOnboardingData } from '../../lib/onboarding';

/** How long the analysing screen is shown before moving to the dashboard. */
const HOLD_MS = 3000;
const DOT_COUNT = 3;
const DOT_STAGGER_MS = 200;

export default function Analysing() {
  const router = useRouter();

  // Continuous rotation for the arc, and one pulse value per loading dot.
  const spin = useRef(new Animated.Value(0)).current;
  const dots = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  // Rotating arc.
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spin]);

  // Staggered pulsing dots. Each loop is padded to the same total length so the
  // 200ms stagger between dots stays constant rather than drifting over time.
  useEffect(() => {
    const maxStagger = (DOT_COUNT - 1) * DOT_STAGGER_MS;
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * DOT_STAGGER_MS),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(maxStagger - index * DOT_STAGGER_MS),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dots]);

  // Warm the onboarding data (the dashboard reads it straight from AsyncStorage)
  // and move on after the hold.
  useEffect(() => {
    void getOnboardingData();
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [router]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* No back gesture - this screen advances on its own. */}
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.circle}>
          <Animated.View
            style={[styles.ring, { transform: [{ rotate }] }]}
          />
          <ShieldLogo width={71} height={80} />
        </View>

        <Text style={styles.title}>Checking your compliance...</Text>
        <Text style={styles.subtitle}>
          Reviewing the latest Renters Rights Act requirements
        </Text>

        <View style={styles.dotsRow}>
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scale: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    // Faint full ring with a solid green arc that rotates.
    borderColor: 'rgba(255,255,255,0.12)',
    borderTopColor: colours.green,
  },
  title: {
    color: colours.white,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 32,
  },
  subtitle: {
    color: colours.white,
    fontSize: 15,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colours.green,
    marginHorizontal: 4,
  },
});
