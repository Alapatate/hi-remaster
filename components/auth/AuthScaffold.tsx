import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORANGE = '#bf6e1a';
/** Reanimated `entering` values are loosely typed; alias it once for our props. */
type Entering = React.ComponentProps<typeof Animated.View>['entering'];

/**
 * Shared shell for the auth screens: an animated warm hero with the "HI"
 * wordmark, then a cream card that slides up over it holding the form.
 */
export function AuthScreen({
  title,
  subtitle,
  heroRatio = 0.4,
  children,
}: {
  title: string;
  subtitle: string;
  heroRatio?: number;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = height * heroRatio + insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: ORANGE }}>
      <AuthHero height={heroHeight} />

      <KeyboardAvoidingView
        style={{ flex: 1, marginTop: -28 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View
          style={{ flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }}
          className="bg-card">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 28,
              paddingTop: 36,
              paddingBottom: Math.max(insets.bottom + 24, 32),
            }}>
            <Animated.Text
              entering={FadeInDown.delay(80).duration(500)}
              style={{ fontSize: 26, fontWeight: '700', marginBottom: 4 }}
              className="text-foreground">
              {title}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(140).duration(500)}
              className="mb-7 text-base text-muted-foreground">
              {subtitle}
            </Animated.Text>

            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Warm hero: drifting orbs, a slow breathing ring, and the wordmark. */
function AuthHero({ height }: { height: number }) {
  const breath = useSharedValue(0);
  const floatA = useSharedValue(0);
  const floatB = useSharedValue(0);

  React.useEffect(() => {
    const loop = (v: typeof breath, d: number) =>
      (v.value = withRepeat(withTiming(1, { duration: d, easing: Easing.inOut(Easing.ease) }), -1, true));
    loop(breath, 3800);
    loop(floatA, 5200);
    loop(floatB, 6400);
  }, [breath, floatA, floatB]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.18 }],
    opacity: 0.5 - breath.value * 0.32,
  }));
  const orbA = useAnimatedStyle(() => ({
    transform: [{ translateY: -16 + floatA.value * 32 }, { translateX: floatA.value * 12 }],
  }));
  const orbB = useAnimatedStyle(() => ({
    transform: [{ translateY: 16 - floatB.value * 28 }, { translateX: -floatB.value * 10 }],
  }));

  return (
    <View style={{ height }} className="items-center justify-center overflow-hidden">
      {/* Soft drifting orbs for depth + life */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: '14%', left: '12%', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,238,214,0.22)' },
          orbA,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', bottom: '16%', right: '10%', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(140,74,12,0.20)' },
          orbB,
        ]}
      />

      {/* Breathing ring behind the wordmark */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.06)' },
          ringStyle,
        ]}
      />

      <Animated.Text
        entering={FadeInDown.duration(800)}
        style={{ fontSize: 66, fontWeight: '700', color: 'white', letterSpacing: 8, lineHeight: 74, paddingLeft: 8 }}>
        HI
      </Animated.Text>
    </View>
  );
}

/** Labelled text field with optional trailing adornment and an entrance. */
export function AuthField({
  label,
  right,
  entering,
  ...props
}: TextInputProps & { label: string; right?: React.ReactNode; entering?: Entering }) {
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? '#8a7a6a' : '#a89880';

  return (
    <Animated.View entering={entering}>
      <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6 }} className="text-foreground">
        {label}
      </Text>
      <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={{ flex: 1, height: 52, borderRadius: 14, paddingHorizontal: 16, paddingRight: right ? 48 : 16, fontSize: 15 }}
          className="border border-border bg-background text-foreground"
          placeholderTextColor={placeholderColor}
          {...props}
        />
        {right ? <View style={{ position: 'absolute', right: 14 }}>{right}</View> : null}
      </View>
    </Animated.View>
  );
}

export function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? '#8a7a6a' : '#a89880';
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} hitSlop={8}>
      {show ? <EyeOffIcon size={20} color={color} /> : <EyeIcon size={20} color={color} />}
    </TouchableOpacity>
  );
}

/** Primary submit button with a gentle press-scale. */
export function AuthButton({
  label,
  loading,
  onPress,
  entering,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
  entering?: Entering;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={entering} style={[{ marginTop: 28 }, style]}>
      <Pressable
        onPress={onPress}
        disabled={loading}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 120 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 160 }))}
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: loading ? '#d4a46a' : ORANGE,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** "Don't have an account? Sign up" style footer with a link. */
export function AuthFooterLink({
  prompt,
  action,
  href,
  entering,
}: {
  prompt: string;
  action: string;
  href: string;
  entering?: Entering;
}) {
  return (
    <Animated.View entering={entering} className="mt-8 flex-row items-center justify-center gap-1.5">
      <Text className="text-sm text-muted-foreground">{prompt}</Text>
      <Link href={href as never} asChild>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={{ color: ORANGE, fontSize: 14, fontWeight: '700' }}>{action}</Text>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}
