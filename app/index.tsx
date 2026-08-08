import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/** The cat artwork is white, so it sits on the brand accent for contrast. */
const SPLASH_BG = '#bf6e1a';
const SPLASH_FG = '#f5ead8';
/** phi.json runs ~1s, so this is two full cycles before the fade. */
const LOOP_MS = 2000;
const FADE_MS = 500;

export default function Splash() {
  const { user, loading } = useAuth();
  const bgOpacity = useSharedValue(0);
  const exitOpacity = useSharedValue(1);

  const navigate = useCallback(() => {
    router.replace(user ? '/(protected)/videos' : '/(auth)/sign-in');
  }, [user]);

  // Fade the brand background in on mount, hold while auth resolves, then fade
  // out and navigate. Driven by a timer rather than onAnimationFinish, which
  // never fires on a looping animation.
  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: FADE_MS });
    if (loading) return;

    const fadeTimer = setTimeout(() => {
      bgOpacity.value = withTiming(0, { duration: FADE_MS });
      exitOpacity.value = withTiming(0, { duration: FADE_MS });
    }, LOOP_MS);
    const navTimer = setTimeout(navigate, LOOP_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [bgOpacity, exitOpacity, loading, navigate]);

  const backgroundStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: exitOpacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      <Animated.View style={[styles.content, contentStyle]}>
        <LottieView
          source={require('@/animations/phi.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text className="font-heading text-2xl" style={styles.caption}>
            murr murr in progress...
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
  },
  content: {
    alignItems: 'center',
  },
  lottie: {
    width: 220,
    height: 220,
  },
  caption: {
    marginTop: 12,
    fontSize: 15,
    color: SPLASH_FG,
  },
});
