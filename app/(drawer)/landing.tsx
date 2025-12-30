import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const steps = [
  { title: 'Choose a Growth Plan', desc: 'Pick the plan that matches your goals and pace.' },
  { title: 'Connect your social profiles', desc: 'Securely link the platforms you want to grow.' },
  { title: 'We manage visibility & engagement', desc: 'Our system orchestrates delivery across channels.' },
  { title: 'Track performance in real time', desc: 'See reach, engagement, and delivery status live.' },
];

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');

  return (
    <LinearGradient colors={['#05060b', '#0c1a33']} style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        <View style={styles.badgeRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>reach974</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.eyebrow}>Safe & Legit</Text>
          <Text style={styles.headline}>📈 Accelerate Your Social Media Growth — Without Guesswork</Text>
          <Text style={styles.subheadline}>
            Managed engagement, visibility, and discoverability services designed to help brands grow faster on social platforms.
          </Text>
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => router.push('/(drawer)/chat')}
            style={({ pressed }) => [styles.primaryCta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.primaryCtaText}>Get Started</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/screens/subscription')}
            style={({ pressed }) => [styles.secondaryCta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.secondaryCtaText}>View Growth Plans</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trusted proof</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.cardText}>Trusted by creators & businesses</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.cardText}>Serving multiple platforms</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.cardText}>Data-driven delivery</Text>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>How it works</Text>
          {steps.map((step, idx) => (
            <View key={step.title} style={[styles.stepRow, idx > 0 && { marginTop: 12 }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Pressable
            onPress={() => router.push('/(drawer)/chat')}
            style={({ pressed }) => [styles.fullCta, pressed && styles.ctaPressed, { width: width - 40 }]}
          >
            <Text style={styles.primaryCtaText}>Start growing with reach974</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5EE0A3',
    marginRight: 8,
  },
  brandText: {
    color: '#E8EDF5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  eyebrow: {
    color: '#7AD7F0',
    fontSize: 13,
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headline: {
    color: '#F6F8FB',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subheadline: {
    color: '#C6CFDD',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  primaryCta: {
    flex: 1,
    backgroundColor: '#D71F55',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#D71F55',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  secondaryCta: {
    flex: 1,
    borderColor: '#5EE0A3',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  secondaryCtaText: {
    color: '#5EE0A3',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  card: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  cardTitle: {
    color: '#F6F8FB',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  cardText: {
    color: '#D8DEEA',
    fontSize: 14,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  bullet: {
    color: '#5EE0A3',
    fontSize: 16,
    fontWeight: '800',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(94,224,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(94,224,163,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#5EE0A3',
    fontWeight: '800',
  },
  stepTitle: {
    color: '#F6F8FB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    color: '#C6CFDD',
    fontSize: 14,
    lineHeight: 20,
  },
  fullCta: {
    backgroundColor: '#D71F55',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#D71F55',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
});

