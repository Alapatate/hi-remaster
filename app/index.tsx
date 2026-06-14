import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export default function Splash() {
  const { user, loading } = useAuth();
  const lottieRef = useRef<LottieView>(null);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!loading) {
      lottieRef.current?.play();
    }
  }, [loading]);

  const navigate = useCallback(() => {
    router.replace(user ? '/(protected)/videos' : '/(auth)/sign-in');
  }, [user]);

  const handleAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled) return;
      opacity.value = withDelay(200, withTiming(0, { duration: 500 }));
      setTimeout(navigate, 750);
    },
    [navigate, opacity]
  );

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.lottieWrap}>
        <LottieView
          ref={lottieRef}
          source={require('@/animations/Hello.json')}
          autoPlay={false}
          loop={false}
          style={styles.lottie}
          onAnimationFinish={handleAnimationFinish}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieWrap: {
    width: 280,
    height: 280,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
