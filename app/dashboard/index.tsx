import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { colours } from '../../constants/colours';
import { complianceItems, ComplianceItem } from '../../constants/compliance';
import {
  getItemStatus,
  getProvenIds,
  ItemStatus,
} from '../../lib/complianceStatus';
import { clearOnboardingData, getOnboardingData } from '../../lib/onboarding';
import { clearAllProof } from '../../lib/proof';

// Points awarded per item: full credit for proven, half for claimed-only.
const POINTS_PROVEN = 10;
const POINTS_CLAIMED = 5;

// Gauge geometry.
const GAUGE_SIZE = 200;
const GAUGE_STROKE = 14;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

/** Map a 0-100 score to a status band. */
function scoreBand(score: number): ItemStatus {
  if (score <= 40) {
    return 'red';
  }
  if (score <= 70) {
    return 'amber';
  }
  return 'green';
}

/** The palette colour for a status band. */
function bandColour(status: ItemStatus): string {
  if (status === 'red') {
    return colours.red;
  }
  if (status === 'amber') {
    return colours.amber;
  }
  return colours.green;
}

/** Lower-case the first character of a string. */
function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/** Status label shown under each item name. */
function statusLabel(item: ComplianceItem, status: ItemStatus): string {
  if (status === 'green') {
    return 'Verified ✓';
  }
  if (status === 'amber') {
    if (item.id === 'prs-database') {
      return 'Required from 2027 - register early';
    }
    return 'Claimed but not proven - upload proof';
  }
  // Red. fineAmount already reads like "Up to £6,000" or "Blocks Section 8
  // possession", so compose without doubling "up to".
  const fine = item.fineAmount;
  return /^up to/i.test(fine)
    ? `Missing - fine ${lowerFirst(fine)}`
    : `Missing - ${lowerFirst(fine)}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [provenIds, setProvenIds] = useState<string[]>([]);

  // Reload on focus so the screen reflects proof saved on other screens.
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

  // Build the per-item rows and the overall score from current data.
  const rows = complianceItems.map((item) => {
    const status = getItemStatus(item, claimedIds, provenIds);
    return { item, status, label: statusLabel(item, status) };
  });

  const score = complianceItems.reduce((sum, item) => {
    if (provenIds.includes(item.id)) {
      return sum + POINTS_PROVEN;
    }
    if (claimedIds.includes(item.id)) {
      return sum + POINTS_CLAIMED;
    }
    return sum;
  }, 0);

  const band = scoreBand(score);
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - score / 100);

  const firstRed = rows.find((row) => row.status === 'red');
  const firstAmber = rows.find((row) => row.status === 'amber');
  const hasRed = Boolean(firstRed);
  const hasAmber = Boolean(firstAmber);

  // Bottom button: prioritise red, then amber, otherwise all-green report.
  const cta = hasRed
    ? { label: 'Fix Urgent Issues Now', style: styles.buttonRed }
    : hasAmber
      ? { label: 'Upload Proof for Amber Items', style: styles.buttonAmber }
      : { label: 'All Compliant - View Report', style: styles.buttonGreen };
  const ctaTarget = firstRed ?? firstAmber ?? rows[0];

  const handleCtaPress = () => {
    if (ctaTarget) {
      router.push(`/fix/${ctaTarget.item.id}`);
    }
  };

  const handleStartOver = () => {
    Alert.alert(
      'Start Over',
      'This will reset all your compliance data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearOnboardingData();
            await clearAllProof();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Pinned header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Your Compliance Report</Text>
          <Text style={styles.headerSubtitle}>
            Based on the Renters Rights Act 2026
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleStartOver}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Start over"
        >
          <Ionicons name="settings-outline" size={22} color={colours.white} />
        </TouchableOpacity>
      </View>

      {/* Pinned score gauge */}
      <View style={styles.scoreSection}>
        <View style={styles.gauge}>
          <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={styles.gaugeSvg}>
            {/* Faint full track so the gauge reads as "empty" at score 0. */}
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={GAUGE_RADIUS}
              stroke={colours.red}
              strokeOpacity={0.2}
              strokeWidth={GAUGE_STROKE}
              fill="none"
            />
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={GAUGE_RADIUS}
              stroke={bandColour(band)}
              strokeWidth={GAUGE_STROKE}
              fill="none"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.gaugeCenter}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreOutOf}>out of 100</Text>
          </View>
        </View>

        <Text style={[styles.statusText, statusColour(band)]}>
          {band === 'red'
            ? 'Action needed urgently'
            : band === 'amber'
              ? 'Some gaps to address'
              : 'Looking good'}
        </Text>
      </View>

      {/* Scrolling compliance list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row) => (
          <TouchableOpacity
            key={row.item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/fix/${row.item.id}`)}
          >
            <View style={[styles.dot, dotColour(row.status)]} />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{row.item.name}</Text>
              <Text style={[styles.cardLabel, statusColour(row.status)]}>
                {row.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, cta.style]}
          activeOpacity={0.85}
          onPress={handleCtaPress}
        >
          <Text style={styles.buttonText}>{cta.label}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** Text-colour style for a status. */
function statusColour(status: ItemStatus) {
  if (status === 'red') {
    return styles.colourRed;
  }
  if (status === 'amber') {
    return styles.colourAmber;
  }
  return styles.colourGreen;
}

/** Background-colour style for a status dot. */
function dotColour(status: ItemStatus) {
  if (status === 'red') {
    return styles.dotRed;
  }
  if (status === 'amber') {
    return styles.dotAmber;
  }
  return styles.dotGreen;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.navy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 24,
    marginTop: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    color: colours.white,
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: colours.white,
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scoreSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  gauge: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeSvg: {
    // Start the arc at the top (12 o'clock) instead of 3 o'clock.
    transform: [{ rotate: '-90deg' }],
  },
  gaugeCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    color: colours.white,
    fontSize: 56,
    fontWeight: '600',
  },
  scoreOutOf: {
    color: colours.white,
    fontSize: 13,
    opacity: 0.6,
    marginTop: -4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 64,
    borderRadius: 12,
    backgroundColor: colours.cardBackground,
    padding: 16,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    color: colours.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cardLabel: {
    fontSize: 13,
    marginTop: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Status colour variants (kept as named refs so no inline style objects).
  colourRed: { color: colours.red },
  colourAmber: { color: colours.amber },
  colourGreen: { color: colours.green },
  dotRed: { backgroundColor: colours.red },
  dotAmber: { backgroundColor: colours.amber },
  dotGreen: { backgroundColor: colours.green },
  buttonRed: { backgroundColor: colours.red },
  buttonAmber: { backgroundColor: colours.amber },
  buttonGreen: { backgroundColor: colours.green },
});
