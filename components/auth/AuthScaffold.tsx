import { HiLogo } from '@/components/brand/HiLogo';
import { Text } from '@/components/ui/text';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORANGE = '#bf6e1a';
const BRAND = 'Harmony Immersion';

/** Reanimated `entering` values are loosely typed; alias it once for our props. */
type Entering = React.ComponentProps<typeof Animated.View>['entering'];

/**
 * Shell shared by sign-in and register: the page colour, the soft decorative
 * discs bleeding off the corners, and a keyboard-aware scroll area whose
 * content can push its footer to the bottom.
 */
export function AuthScreen({
  discs = 'signIn',
  children,
}: {
  /** Which corner treatment to draw — the two screens differ in the comp. */
  discs?: 'signIn' | 'register';
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  // KeyboardAvoidingView is a no-op on Android here: `behavior` has no sensible
  // Android value, and with edge-to-edge enabled the window no longer resizes
  // for `adjustResize`, so a focused field can end up behind the keyboard.
  // Shrinking the scroll area by the live keyboard height fixes both platforms,
  // and lets the native scroll view bring the focused input into view.
  const keyboard = useAnimatedKeyboard();
  const keyboardInset = useAnimatedStyle(() => ({ marginBottom: keyboard.height.value }));

  return (
    <View className="flex-1 bg-background">
      {/* Decorative only, and never interactive. */}
      <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
        {discs === 'signIn' ? (
          <>
            <View
              className="absolute h-[260px] w-[260px] rounded-full bg-primary/10"
              style={{ left: -70, top: -60 }}
            />
          </>
        ) : (
          <View
            className="absolute h-[250px] w-[250px] rounded-full bg-olive/10"
            style={{ right: -80, top: -70 }}
          />
        )}
      </View>

      <Animated.View style={[{ flex: 1 }, keyboardInset]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
          }}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/**
 * The wordmark: the HI SVG mark next to the name. `stacked` breaks the name
 * over two lines for the sign-in header; `inline` is the compact version that
 * sits in the register screen's top bar.
 */
export function BrandMark({ variant = 'stacked' }: { variant?: 'stacked' | 'inline' }) {
  const stacked = variant === 'stacked';

  return (
    <View className="flex-row items-center" style={{ gap: stacked ? 12 : 8 }}>
      <HiLogo height={stacked ? 46 : 26} color="#000" />
      <Text className={`font-heading ${stacked ? 'text-[22px] leading-tight' : 'text-[14.5px]'}`}>
        {stacked ? BRAND.replace(' ', '\n') : BRAND}
      </Text>
    </View>
  );
}

/** Large display headline, set in the heading face. */
export function AuthHeadline({ children, size = 60 }: { children: string; size?: number }) {
  return (
    <Text className="font-heading" style={{ fontSize: size, lineHeight: size * 1.06 }}>
      {children}
    </Text>
  );
}

/**
 * Pill text field with an uppercase label. The border thickens to the accent
 * colour on focus, which is the only state change in the comp.
 */
export function AuthField({
  label,
  right,
  entering,
  ...props
}: TextInputProps & { label: string; right?: React.ReactNode; entering?: Entering }) {
  const { colorScheme } = useColorScheme();
  const [focused, setFocused] = React.useState(false);
  const placeholderColor = colorScheme === 'dark' ? '#8a7a6a' : '#a89880';

  return (
    <Animated.View entering={entering}>
      <Text className="mb-1.5 font-body-semibold text-[12px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <View className="relative flex-row items-center">
        <TextInput
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 999,
            paddingHorizontal: 20,
            paddingRight: right ? 52 : 20,
            fontSize: 15.5,
            fontFamily: 'Figtree_400Regular',
            borderWidth: focused ? 2 : 1,
          }}
          className={`bg-card text-foreground ${focused ? 'border-primary' : 'border-border'}`}
          placeholderTextColor={placeholderColor}
          {...props}
        />
        {right ? <View className="absolute right-5">{right}</View> : null}
      </View>
    </Animated.View>
  );
}

export function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? '#8a7a6a' : '#645c50';
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} hitSlop={8}>
      {show ? <EyeOffIcon size={19} color={color} /> : <EyeIcon size={19} color={color} />}
    </TouchableOpacity>
  );
}

/** Primary pill action with a gentle press-scale. */
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
    <Animated.View entering={entering} style={style}>
      <Pressable
        onPress={onPress}
        disabled={loading}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 120 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 160 }))}
        className="h-14 items-center justify-center rounded-full bg-primary"
        style={{ opacity: loading ? 0.7 : 1 }}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="font-heading text-[18px] text-primary-foreground">{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** Circular back control used in the register screen's top bar. */
export function AuthBackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
      {/* An icon, not a "←" glyph — text centres on its baseline, which left the
          arrow visibly high in the circle. */}
      <ArrowLeftIcon size={20} className="text-foreground" />
    </TouchableOpacity>
  );
}

/** "New here? Create an account" footer. */
export function AuthFooterLink({
  prompt,
  action,
  onPress,
  entering,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
  entering?: Entering;
}) {
  return (
    <Animated.View
      entering={entering}
      className="mt-1 flex-row items-center justify-center gap-1.5">
      <Text className="font-body text-[14.5px] text-muted-foreground">{prompt}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text className="font-body-semibold text-[14.5px]" style={{ color: ORANGE }}>
          {action}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/** Inline validation / server error line. */
export function AuthError({ message }: { message: string }) {
  return <Text className="mt-3 px-1 font-body text-sm text-destructive">{message}</Text>;
}
