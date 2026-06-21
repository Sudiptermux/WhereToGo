import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: Props) {
  const { colors, isDark } = useTheme();
  
  // Animation values
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const textTracking = useSharedValue(10);
  const tagOpacity = useSharedValue(0);
  const tagTranslateY = useSharedValue(20);
  const cornerOpacity = useSharedValue(0);
  const cornerSlide = useSharedValue(30);
  const splashOpacity = useSharedValue(1);
  const splashScale = useSharedValue(1); 
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const bgGlowOpacity = useSharedValue(0);

  const premiumEasing = Easing.bezier(0.33, 1, 0.68, 1);
  const bounceEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

  useEffect(() => {
    bgGlowOpacity.value = withTiming(1, { duration: 1500 });
    logoOpacity.value = withTiming(1, { duration: 1000, easing: premiumEasing });
    logoScale.value = withTiming(1, { duration: 1200, easing: bounceEasing });

    ringOpacity.value = withDelay(800, withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) })
    ));
    ringScale.value = withDelay(800, withTiming(2.5, { duration: 1500, easing: Easing.out(Easing.quad) }));

    cornerOpacity.value = withDelay(600, withTiming(1, { duration: 1000 }));
    cornerSlide.value = withDelay(600, withTiming(0, { duration: 1200, easing: premiumEasing }));

    textOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
    textTranslateY.value = withDelay(1000, withTiming(0, { duration: 1200, easing: premiumEasing }));
    textTracking.value = withDelay(1000, withTiming(0, { duration: 1500, easing: premiumEasing }));

    tagOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
    tagTranslateY.value = withDelay(1400, withTiming(0, { duration: 1000, easing: premiumEasing }));

    const timer = setTimeout(() => {
      cornerOpacity.value = withTiming(0, { duration: 400 });
      tagOpacity.value = withTiming(0, { duration: 400 });
      splashScale.value = withTiming(1.08, { duration: 800, easing: Easing.out(Easing.cubic) });
      splashOpacity.value = withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }, () => {
        runOnJS(onAnimationComplete)();
      });
    }, 3000);

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
    opacity: bgGlowOpacity.value * (isDark ? 0.4 : 0.2),
    transform: [{ scale: interpolate(bgGlowOpacity.value, [0, 1], [0.8, 1.2]) }]
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
    transform: [{ scale: splashScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, containerStyle]}>
      <LinearGradient 
        colors={colors.backgroundGradient} 
        style={StyleSheet.absoluteFill} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View style={[styles.ambientGlow, { backgroundColor: isDark ? 'rgba(0, 188, 212, 0.08)' : 'rgba(0, 188, 212, 0.15)' }, bgGlowStyle]} />

      <Animated.View style={[styles.topLeftCorner, { borderColor: isDark ? 'rgba(0, 188, 212, 0.3)' : 'rgba(0, 188, 212, 0.4)' }, topLeftCornerStyle]} />
      <Animated.View style={[styles.bottomRightCorner, { borderColor: isDark ? 'rgba(0, 188, 212, 0.3)' : 'rgba(0, 188, 212, 0.4)' }, bottomRightCornerStyle]} />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.expansionRing, { borderColor: colors.primary }, ringStyle]} />

        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Ionicons name="compass" size={100} color={isDark ? "#081a2e" : "#fff"} />
            <LinearGradient 
                colors={['rgba(255,255,255,0.4)', 'transparent']} 
                style={styles.logoReflect}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.titleContainer, textStyle]}>
          <Text style={[styles.titleMain, { color: colors.text }]}>Where</Text>
          <Text style={[styles.titleAccent, { color: isDark ? '#00bcd4' : '#0097a7' }]}>ToGo</Text>
        </Animated.View>

        <Animated.View style={[styles.tagContainer, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }, tagStyle]}>
          <View style={[styles.dot, { backgroundColor: colors.accent, shadowColor: colors.accent }]} />
          <Text style={[styles.tagText, { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }]}>READY TO EXPLORE</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
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
    borderBottomRightRadius: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expansionRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  logoContainer: {
    marginBottom: 40,
    zIndex: 10,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 35,
    elevation: 20,
    overflow: 'hidden',
  },
  logoReflect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 70,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  titleMain: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
  },
  titleAccent: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
