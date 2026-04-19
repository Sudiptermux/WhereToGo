import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: Props) {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const textTracking = useSharedValue(10);
  const tagOpacity = useSharedValue(0);
  const tagTranslateY = useSharedValue(20);
  const cornerOpacity = useSharedValue(0);
  const cornerSlide = useSharedValue(30);
  const splashOpacity = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const bgGlowOpacity = useSharedValue(0);

  const premiumEasing = Easing.bezier(0.33, 1, 0.68, 1); // Premium Out-Expo
  const bounceEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

  useEffect(() => {
    // 1. Theme Entry
    bgGlowOpacity.value = withTiming(1, { duration: 1500 });
    
    // 2. Logo Animation
    logoOpacity.value = withTiming(1, { duration: 1000, easing: premiumEasing });
    logoScale.value = withTiming(1, { duration: 1200, easing: bounceEasing });

    // 3. Expansion Rings
    ringOpacity.value = withDelay(800, withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) })
    ));
    ringScale.value = withDelay(800, withTiming(2.5, { duration: 1500, easing: Easing.out(Easing.quad) }));

    // 4. Corners Entry
    cornerOpacity.value = withDelay(600, withTiming(1, { duration: 1000 }));
    cornerSlide.value = withDelay(600, withTiming(0, { duration: 1200, easing: premiumEasing }));

    // 5. Typography Reveal
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    textTranslateY.value = withDelay(1000, withTiming(0, { duration: 1200, easing: premiumEasing }));
    textTracking.value = withDelay(1000, withTiming(0, { duration: 1500, easing: premiumEasing }));

    tagOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
    tagTranslateY.value = withDelay(1400, withTiming(0, { duration: 1000, easing: premiumEasing }));

    // 6. Final Exit
    const timer = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }, () => {
        runOnJS(onAnimationComplete)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
        { translateY: textTranslateY.value },
        { scale: interpolate(textOpacity.value, [0, 1], [0.95, 1]) }
    ],
    letterSpacing: textTracking.value,
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagTranslateY.value }],
  }));

  const topLeftCornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
    transform: [
        { translateX: -cornerSlide.value },
        { translateY: -cornerSlide.value }
    ],
  }));

  const bottomRightCornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
    transform: [
        { translateX: cornerSlide.value },
        { translateY: cornerSlide.value }
    ],
  }));

  const bgGlowStyle = useAnimatedStyle(() => ({
    opacity: bgGlowOpacity.value * 0.4,
    transform: [{ scale: interpolate(bgGlowOpacity.value, [0, 1], [0.8, 1.2]) }]
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient 
        colors={['#060606', '#0a1a2e', '#060606']} 
        style={StyleSheet.absoluteFill} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Ambient Glow */}
      <Animated.View style={[styles.ambientGlow, bgGlowStyle]} />

      {/* Corner Accents */}
      <Animated.View style={[styles.topLeftCorner, topLeftCornerStyle]} />
      <Animated.View style={[styles.bottomRightCorner, bottomRightCornerStyle]} />

      <View style={styles.centerContent}>
        {/* Outer Ring Pulse */}
        <Animated.View style={[styles.expansionRing, ringStyle]} />

        {/* Animated Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoCircle}>
            <Ionicons name="compass" size={60} color="#081a2e" />
            <LinearGradient 
                colors={['rgba(255,255,255,0.4)', 'transparent']} 
                style={styles.logoReflect}
            />
          </View>
        </Animated.View>

        {/* Animated Title */}
        <Animated.View style={[styles.titleContainer, textStyle]}>
          <Text style={styles.titleWhite}>Where</Text>
          <Text style={styles.titleCyan}>ToGo</Text>
        </Animated.View>

        {/* Animated Tagline */}
        <Animated.View style={[styles.tagContainer, tagStyle]}>
          <View style={styles.dot} />
          <Text style={styles.tagText}>READY TO EXPLORE</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060606',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(0, 188, 212, 0.08)',
    top: -width * 0.2,
    left: -width * 0.2,
  },
  topLeftCorner: {
    position: 'absolute',
    top: 60,
    left: 40,
    width: 60,
    height: 60,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    borderTopLeftRadius: 20,
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 60,
    right: 40,
    width: 60,
    height: 60,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    borderBottomRightRadius: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expansionRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00F2FE',
  },
  logoContainer: {
    marginBottom: 40,
    zIndex: 10,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 40,
    backgroundColor: '#00F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  logoReflect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  titleWhite: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  titleCyan: {
    fontSize: 52,
    fontWeight: '900',
    color: '#00bcd4',
    letterSpacing: -2,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
    marginRight: 12,
    shadowColor: '#FF9800',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  tagText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
