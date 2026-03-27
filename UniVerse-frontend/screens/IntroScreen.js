/**
 * IntroScreen.js
 * ─────────────────────────────────────────────────────────────────────────────
 * A brand-new, self-contained screen inserted BEFORE GetStartedScreen.
 * GetStartedScreen.js is NEVER imported, modified, or touched in any way.
 *
 * CINEMATIC FLOW
 * ──────────────
 *  Phase 0  (0 ms)       → Video fills screen, muted, autoplaying
 *  Phase 1  (2400 ms)    → Dark overlay fades in (max opacity 0.32)
 *  Phase 2  (2700 ms)    → Blur layer fades in
 *  Phase 3  (3100 ms)    → Logo fades + gently scales in from centre
 *  Phase 4  (3700 ms)    → App name + tagline fade in
 *  Phase 5  (4900 ms)    → navigation.replace('GetStarted')
 *                          screen transitions with a soft cross-fade
 *
 * FALLBACK
 * ────────
 *  - If assets/videos/intro.mp4 is missing  → dark-navy gradient used instead
 *  - If expo-av is not installed             → same gradient fallback
 *  - If expo-blur is not installed           → blur layer silently skipped
 *  - animationStarted ref prevents sequence from firing more than once
 *
 * EXISTING SCREEN
 * ───────────────
 *  GetStartedScreen is registered separately in AppNavigator.
 *  This file never renders, wraps, or references it.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Optional: expo-av ─────────────────────────────────────────────────────────
let Video = null;
try { Video = require('expo-av').Video; } catch (_) {}

// ── Optional: expo-blur ───────────────────────────────────────────────────────
let BlurView = null;
try { BlurView = require('expo-blur').BlurView; } catch (_) {}

// ── Optional: intro video ─────────────────────────────────────────────────────
let INTRO_VIDEO = null;
try { INTRO_VIDEO = require('../assets/videos/intro.mp4'); } catch (_) {}

// ── Layout constants ──────────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const LOGO_ASPECT = 562 / 618;           // exact pixel dimensions of logo.png
const LOGO_W      = Math.min(width * 0.68, 290);
const LOGO_H      = LOGO_W / LOGO_ASPECT;

// ── Timing map (all values in ms) ────────────────────────────────────────────
// VIDEO path — used when the mp4 is present
const V = {
  OVERLAY_START : 2400,
  OVERLAY_DUR   : 700,
  BLUR_START    : 2700,
  BLUR_DUR      : 600,
  LOGO_START    : 3100,
  LOGO_DUR      : 900,
  TEXT_START    : 3700,
  TEXT_DUR      : 700,
  NAVIGATE      : 4900,
};

// FALLBACK path — used when no video file exists
const F = {
  OVERLAY_START : 200,
  OVERLAY_DUR   : 600,
  BLUR_START    : 400,
  BLUR_DUR      : 500,
  LOGO_START    : 600,
  LOGO_DUR      : 900,
  TEXT_START    : 1100,
  TEXT_DUR      : 700,
  NAVIGATE      : 2800,
};

// ─────────────────────────────────────────────────────────────────────────────
export default function IntroScreen({ navigation }) {

  // Animated values — all start at 0 / identity
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const blurOpacity    = useRef(new Animated.Value(0)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.86)).current;
  const textOpacity    = useRef(new Animated.Value(0)).current;

  // Guard: sequence must only fire once
  const sequenceStarted = useRef(false);

  const [videoError, setVideoError] = useState(false);

  const hasVideo = !!INTRO_VIDEO && !videoError && Video !== null;
  const T        = hasVideo ? V : F;

  // ── Animation sequence ──────────────────────────────────────────────────────
  const startSequence = useCallback(() => {
    if (sequenceStarted.current) return;
    sequenceStarted.current = true;

    // 1. Dark overlay
    setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0.32,
        duration: T.OVERLAY_DUR,
        useNativeDriver: true,
      }).start();
    }, T.OVERLAY_START);

    // 2. Blur layer
    setTimeout(() => {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: T.BLUR_DUR,
        useNativeDriver: true,
      }).start();
    }, T.BLUR_START);

    // 3. Logo fade + spring scale
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: T.LOGO_DUR,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
      ]).start();
    }, T.LOGO_START);

    // 4. Text
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: T.TEXT_DUR,
        useNativeDriver: true,
      }).start();
    }, T.TEXT_START);

    // 5. Cross-fade to GetStarted (replace so back never returns here)
    setTimeout(() => {
      navigation.replace('GetStarted');
    }, T.NAVIGATE);
  }, [T]);                              // eslint-disable-line

  // Start immediately when there is no video
  useEffect(() => {
    if (!hasVideo) startSequence();
  }, []);                               // eslint-disable-line

  // ── Video status handler ────────────────────────────────────────────────────
  const handleStatus = useCallback((status) => {
    if (status.isLoaded && status.isPlaying) {
      startSequence();
    }
  }, [startSequence]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 1 — Background
          Video (if available) or dark-navy gradient fallback
      ──────────────────────────────────────────────────────────────────── */}
      {hasVideo ? (
        <Video
          source={INTRO_VIDEO}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          shouldPlay
          isMuted
          isLooping={false}
          useNativeControls={false}
          onPlaybackStatusUpdate={handleStatus}
          onError={() => {
            setVideoError(true);
            sequenceStarted.current = false; // allow sequence to restart
            startSequence();
          }}
        />
      ) : (
        <LinearGradient
          colors={['#0A1020', '#0D1B40', '#0E1A3A', '#071020']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 2 — Dark overlay (fades in at phase 1)
          Pure black at low opacity — does NOT stay after navigation
      ──────────────────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, s.darkOverlay, { opacity: overlayOpacity }]}
      />

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 3 — Blur overlay (fades in at phase 2)
          expo-blur used if available; falls back to semi-transparent layer
      ──────────────────────────────────────────────────────────────────── */}
      {BlurView ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
        >
          <BlurView
            intensity={14}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            s.blurFallback,
            { opacity: blurOpacity },
          ]}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 4 — Radial gold glow (appears with logo, purely cosmetic)
      ──────────────────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.glowCircle,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      />

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 5 — Logo (fades + scales in at phase 3)
          Transparent PNG, no background, no container box
      ──────────────────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={{ width: LOGO_W, height: LOGO_H }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ────────────────────────────────────────────────────────────────────
          LAYER 6 — Text block (fades in at phase 4)
          Exact same text content as GetStartedScreen — this intro layer only
      ──────────────────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[s.textBlock, { opacity: textOpacity }]}
      >
        <Text style={s.appName}>UniVerse</Text>

        <View style={s.taglineRow}>
          <View style={s.dash} />
          <Text style={s.tagline}>Your University, Connected</Text>
          <View style={s.dash} />
        </View>

        <Text style={s.sub}>ANDHRA UNIVERSITY  ·  VISAKHAPATNAM</Text>
      </Animated.View>

    </View>
  );
}

// ── Styles — IntroScreen only, no shared styles ───────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071020',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Layer 2
  darkOverlay: {
    backgroundColor: '#000000',
  },

  // Layer 3 fallback (when BlurView not available)
  blurFallback: {
    backgroundColor: 'rgba(5, 12, 30, 0.25)',
  },

  // Layer 4 — soft ambient glow
  glowCircle: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignSelf: 'center',
    top: height * 0.5 - 300,
  },

  // Layer 5 — logo
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -height * 0.06,  // nudge logo slightly above true centre
  },

  // Layer 6 — text
  textBlock: {
    position: 'absolute',
    bottom: height * 0.20,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(201,168,76,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dash: {
    width: 28,
    height: 1.5,
    backgroundColor: 'rgba(201,168,76,0.55)',
  },
  tagline: {
    fontSize: 13,
    color: '#C9A84C',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  sub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginTop: 4,
  },
});
