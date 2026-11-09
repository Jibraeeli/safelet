import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { complianceItems } from '../../constants/compliance';
import {
  getItemStatus,
  getProvenIds,
  ItemStatus,
} from '../../lib/complianceStatus';
import { getOnboardingData } from '../../lib/onboarding';

/** Lower-case the first character of a string. */
function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const BADGE_LABEL: Record<ItemStatus, string> = {
  red: 'Urgent Action Needed',
  amber: 'Upload Proof to Verify',
  green: 'Verified ✓',
};

export default function FixScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [provenIds, setProvenIds] = useState<string[]>([]);

  // Reload on focus so returning from the upload screen reflects new proof.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getOnboardingData(), getProvenIds()]).then(
        ([data, proven]) => {
          if (active) {
            setClaimedIds(data.complianceItems ?? []);
            setProvenIds(proven);
          }
        },
      );
      return () => {
        active = false;
      };
    }, []),
  );

  const item = complianceItems.find((entry) => entry.id === id);

  // Guard against an unknown id in the route.
  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.topSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colours.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Compliance item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = getItemStatus(item, claimedIds, provenIds);
  const blocksSection8 = /blocks section 8/i.test(item.fineAmount);
  const requiresAck = item.requiresTenantAcknowledgement;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.topSection}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colours.white} />
        </TouchableOpacity>

        <Text style={styles.breadcrumb}>Dashboard → {item.name}</Text>

        <Text style={styles.pageTitle}>{item.name}</Text>

        <View style={[styles.badge, badgeStyle(status)]}>
          <Text style={styles.badgeText}>{BADGE_LABEL[status]}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1 - Fine / Risk */}
        <View style={styles.card}>
          <View style={styles.riskRow}>
            <Ionicons
              name="warning"
              size={20}
              color={blocksSection8 ? colours.amber : colours.red}
            />
            <Text
              style={[
                styles.riskText,
                blocksSection8 ? styles.colourAmber : styles.colourRed,
              ]}
            >
              {blocksSection8
                ? 'Blocks Section 8 possession if missing'
                : `Fine ${lowerFirst(item.fineAmount)}`}
            </Text>
          </View>
        </View>

        {/* Card 2 - What it is */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>WHAT IT IS</Text>
          <Text style={styles.bodyText}>{item.description}</Text>
        </View>

        {/* Card 3 - Why it matters */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>WHY IT MATTERS</Text>
          <Text style={styles.bodyText}>{item.whyItMatters}</Text>
        </View>

        {/* Card 4 - How to fix it */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>HOW TO FIX IT</Text>
          {item.howToFix.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tenant acknowledgement (only items that require it) */}
        {requiresAck && (
          <View style={styles.ackCard}>
            <Text style={styles.ackLabel}>TENANT ACKNOWLEDGEMENT</Text>
            <Text style={styles.bodyText}>
              Send this directly to your tenant through SafeLet and get a
              timestamped confirmation they received it
            </Text>
            <TouchableOpacity
              style={styles.ackButton}
              activeOpacity={0.85}
              // Wired up later.
              onPress={() => {}}
            >
              <Text style={styles.ackButtonText}>Send to Tenant</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push(`/upload/${item.id}`)}
        >
          <Text style={styles.buttonText}>
            {status === 'green' ? 'View Uploaded Proof' : 'Upload Proof Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** Background-colour style for the status badge. */
function badgeStyle(status: ItemStatus) {
  if (status === 'red') {
    return styles.badgeRed;
  }
  if (status === 'amber') {
    return styles.badgeAmber;
  }
  return styles.badgeGreen;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.navy,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  breadcrumb: {
    color: colours.white,
    fontSize: 12,
    opacity: 0.4,
    marginTop: 12,
  },
  pageTitle: {
    color: colours.white,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  badge: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: {
    color: colours.white,
    fontSize: 14,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colours.white,
    fontSize: 16,
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
    marginTop: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: colours.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionLabel: {
    color: colours.white,
    fontSize: 12,
    opacity: 0.5,
    letterSpacing: 1,
  },
  bodyText: {
    color: colours.white,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colours.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: colours.white,
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    color: colours.white,
    fontSize: 15,
    lineHeight: 20,
  },
  ackCard: {
    backgroundColor: '#1a3a2a',
    borderWidth: 1,
    borderColor: colours.green,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ackLabel: {
    color: colours.green,
    fontSize: 12,
    letterSpacing: 1,
  },
  ackButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: colours.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  ackButtonText: {
    color: colours.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 20,
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
  // Status colour variants (named refs, no inline style objects).
  colourRed: { color: colours.red },
  colourAmber: { color: colours.amber },
  badgeRed: { backgroundColor: colours.red },
  badgeAmber: { backgroundColor: colours.amber },
  badgeGreen: { backgroundColor: colours.green },
});
