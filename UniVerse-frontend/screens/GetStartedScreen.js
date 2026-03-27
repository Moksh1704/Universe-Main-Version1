/**
 * GetStartedScreen.js
 *
 * Layer structure (bottom → top):
 *   1. Video  — fullscreen, muted, looping, resizeMode: 'cover'
 *               Falls back to dark-navy gradient if no video file
 *   2. Dark overlay  — rgba(0,0,0,0.32), fades in at ~2 s
 *   3. Blur overlay  — expo-blur (tint dark, intensity 12), fades in at ~2.3 s
 *   4. Radial glow   — soft gold glow, appears with logo
 *   5. Logo          — transparent PNG, fades + scales in at ~2.6 s
 *   6. UI layer      — appName / tagline / buttons, fades in at ~3.2 s
 *
 * The video NEVER stops or hides — it loops continuously as the background.
 * All UI is rendered ON TOP of the running video.
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
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING, RADIUS } from '../constants/theme';

// ── Optional dependencies (graceful fallback if not installed) ────────────────
let Video    = null;
let BlurView = null;
try { Video    = require('expo-av').Video;        } catch (_) {}
try { BlurView = require('expo-blur').BlurView;   } catch (_) {}

// ── Video asset (graceful fallback if file not placed yet) ───────────────────
let INTRO_VIDEO = null;
try { INTRO_VIDEO = require('../assets/videos/intro.mp4'); } catch (_) {}

// ── Layout ────────────────────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const LOGO_ASPECT = 562 / 618;
const LOGO_W      = Math.min(width * 0.82, 340);   // prominent, fills glow ring
const LOGO_H      = LOGO_W / LOGO_ASPECT;

// ── Animation timing (ms from mount) ─────────────────────────────────────────
// WITH video  — waits ~2 s for video to confirm playing, then animates
const WITH_VIDEO = {
  OVERLAY : { delay: 2000, duration: 700  },
  BLUR    : { delay: 2300, duration: 600  },
  LOGO    : { delay: 2600, duration: 900  },
  UI      : { delay: 3200, duration: 800  },
};
// WITHOUT video — shorter graceful fallback sequence
const NO_VIDEO = {
  OVERLAY : { delay: 300,  duration: 600  },
  BLUR    : { delay: 500,  duration: 500  },
  LOGO    : { delay: 700,  duration: 900  },
  UI      : { delay: 1200, duration: 800  },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function GetStartedScreen({ navigation }) {

  // Animated values
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const blurAnim    = useRef(new Animated.Value(0)).current;
  const logoAnim    = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.87)).current;
  const uiAnim      = useRef(new Animated.Value(0)).current;

  // Guard — sequence fires exactly once
  const started = useRef(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const hasVideo = !!INTRO_VIDEO && !videoFailed && Video !== null;

  // ── Run animation sequence ────────────────────────────────────────────────
  const runSequence = useCallback((T) => {
    if (started.current) return;
    started.current = true;

    const animate = (value, toValue, delay, duration, extra) =>
      setTimeout(() =>
        Animated.timing(value, { toValue, duration, useNativeDriver: true }).start(),
        delay
      );

    animate(overlayAnim, 0.32, T.OVERLAY.delay, T.OVERLAY.duration);
    animate(blurAnim,    1,    T.BLUR.delay,    T.BLUR.duration);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoAnim,  { toValue: 1, duration: T.LOGO.duration, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 55, useNativeDriver: true }),
      ]).start();
    }, T.LOGO.delay);

    animate(uiAnim, 1, T.UI.delay, T.UI.duration);
  }, [overlayAnim, blurAnim, logoAnim, logoScale, uiAnim]);

  // No-video path — start immediately
  useEffect(() => {
    if (!hasVideo) runSequence(NO_VIDEO);
  }, []); // eslint-disable-line

  // Video path — start when playback confirmed
  const handleStatus = useCallback((status) => {
    if (status.isLoaded && status.isPlaying) runSequence(WITH_VIDEO);
  }, [runSequence]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" hidden />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 1 — VIDEO (always running, never hidden, loops forever)
          Falls back to dark-navy gradient when no .mp4 file present
      ══════════════════════════════════════════════════════════════════ */}
      {hasVideo ? (
        <Video
          source={INTRO_VIDEO}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          shouldPlay
          isMuted
          isLooping              // ← loops continuously, never stops
          useNativeControls={false}
          onPlaybackStatusUpdate={handleStatus}
          onError={() => {
            setVideoFailed(true);
            started.current = false;
            runSequence(NO_VIDEO);
          }}
        />
      ) : (
        <LinearGradient
          colors={['#0A1020', '#0D1B40', '#0E1A3A', '#071020']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 2 — Dark overlay  (fades in over the video, stays)
      ══════════════════════════════════════════════════════════════════ */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, s.darkOverlay, { opacity: overlayAnim }]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 3 — Blur overlay  (cinematic depth-of-field feel)
      ══════════════════════════════════════════════════════════════════ */}
      {BlurView ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: blurAnim }]}
        >
          <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, s.blurFallback, { opacity: blurAnim }]}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 4 — Radial gold glow (appears with logo)
      ══════════════════════════════════════════════════════════════════ */}
      <Animated.View
        pointerEvents="none"
        style={[s.glowCircle, { opacity: logoAnim, transform: [{ scale: logoScale }] }]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 5 — Logo  (transparent PNG, no container, no background)
      ══════════════════════════════════════════════════════════════════ */}
      <Animated.View
        pointerEvents="none"
        style={[s.logoWrap, { opacity: logoAnim, transform: [{ scale: logoScale }] }]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={{ width: LOGO_W, height: LOGO_H }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 6 — Full UI  (identical layout / styles / content as before)
          Text · Buttons · Footer — all fade in together above the video
      ══════════════════════════════════════════════════════════════════ */}
      <Animated.View style={[s.uiLayer, { opacity: uiAnim }]}>

        {/* Spacer pushes content down from logo area */}
        <View style={s.spacerTop} />

        {/* App name + tagline */}
        <View style={s.textWrap}>
          <Text style={s.appName}>UniVerse</Text>
          <View style={s.taglineRow}>
            <View style={s.dash} />
            <Text style={s.tagline}>Your University, Connected</Text>
            <View style={s.dash} />
          </View>
          <Text style={s.sub}>ANDHRA UNIVERSITY  ·  VISAKHAPATNAM</Text>
        </View>

        {/* Buttons */}
        <View style={s.btnWrap}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegSelection')}
            activeOpacity={0.88}
            style={s.primaryShadow}
          >
            <LinearGradient
              colors={['#F0C84A', '#C9A84C', '#9A7830']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.primaryGrad}
            >
              <Text style={s.primaryTxt}>Get Started</Text>
              <Ionicons name="arrow-forward-circle" size={22} color="#0A1628" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            style={s.loginBtn}
          >
            <Text style={s.loginTxt}>
              Already have an account?{'  '}
              <Text style={s.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Est. 1926  ·  Premier University of Andhra Pradesh</Text>
      </Animated.View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071020',
  },

  // Layer 2
  darkOverlay: {
    backgroundColor: '#000000',
  },

  // Layer 3 fallback
  blurFallback: {
    backgroundColor: 'rgba(5,12,30,0.22)',
  },

  // Layer 4 — ambient gold glow
  glowCircle: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignSelf: 'center',
    top: height * 0.08,
  },

  // Layer 5 — logo
  logoWrap: {
    position: 'absolute',
    top: height * 0.10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Layer 6 — full UI layer (text + buttons)
  uiLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 44,
  },

  // Spacer so text doesn't overlap logo
  spacerTop: { flex: 1 },

  // Text block — identical values to original
  textWrap: {
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(201,168,76,0.5)',
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
    fontSize: FONTS.sizes.sm,
    color: '#C9A84C',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  sub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginTop: 4,
  },

  // Buttons — identical values to original
  btnWrap: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  primaryShadow: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  primaryTxt: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: '#0A1628',
    letterSpacing: 0.8,
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: 13,
  },
  loginTxt: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  loginBold: {
    color: '#C9A84C',
    fontWeight: '800',
  },

  // Footer — identical value to original
  footer: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
