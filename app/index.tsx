import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShieldLogo from '../components/ShieldLogo';
import { colours } from '../constants/colours';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Top */}
        <View style={styles.topSection}>
          <Text style={styles.logo}>SafeLet</Text>
        </View>

        {/* Middle */}
        <View style={styles.middleSection}>
          <ShieldLogo />
        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Text style={styles.headline}>The new Renters Rights Act is strict.</Text>
          <Text style={styles.subheader}>
            Fines up to £30,000. Let&apos;s keep you safe.
          </Text>
          <Text style={styles.secondLine}>
            Know exactly what you need. Prove you&apos;ve done it.
          </Text>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => router.push('/onboarding/question1')}
          >
            <Text style={styles.buttonText}>Start Free Check →</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>Takes 3 minutes • No card needed</Text>
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
  logo: {
    color: colours.white,
    fontSize: 20,
    fontWeight: '600',
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingBottom: 8,
  },
  headline: {
    color: colours.white,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  subheader: {
    color: colours.white,
    fontSize: 18,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 12,
  },
  secondLine: {
    color: colours.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: colours.green,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    color: colours.white,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 12,
  },
});
